import { collection, doc, getDoc, getDocs, query, runTransaction, where, writeBatch } from "firebase/firestore";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import app, { auth, db } from "@/lib/firebase";
import { Question, Topic } from "@/types/topic/topic";
import { isChoiceQuestion, normalizeAnswer, parseAnswers } from "@/utils/answer";
import { QUESTION_TIME_LIMIT_MS } from "@/utils/game";

export function mapTopic(id: string, data: Record<string, unknown>): Topic {
  return { ...data, id, topicName: String(data.topicName ?? ""), description: String(data.description ?? ""), category: String(data.category ?? "") } as Topic;
}

export async function loadQuestions(topicId: string): Promise<Question[]> {
  const snapshot = await getDocs(collection(db, "topics", topicId, "questions"));
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id } as Question))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function loadMyTopics(): Promise<Topic[]> {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인 후 이용해주세요.");
  const snapshot = await getDocs(query(collection(db, "topics"), where("ownerId", "==", user.uid)));
  return snapshot.docs.map((item) => mapTopic(item.id, item.data()))
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export function validateTopic(topic: Topic, questions: Question[]) {
  if (!topic.topicName.trim() || !topic.category.trim()) throw new Error("주제 제목과 카테고리를 입력해주세요.");
  for (const [index, question] of questions.entries()) {
    const prefix = `${index + 1}번 문제: `;
    if (!question.question.trim()) throw new Error(prefix + "문제 제목을 입력해주세요.");
    if (question.type !== "text") throw new Error(prefix + "현재 텍스트 문제만 저장할 수 있습니다.");
    if (isChoiceQuestion(question)) {
      const options = question.options ?? [];
      if (options.length < 2 || options.some((option) => !option.length)) throw new Error(prefix + "보기를 2개 이상 입력해주세요.");
      if (new Set(options).size !== options.length) throw new Error(prefix + "같은 보기를 중복 입력할 수 없습니다.");
      const correct = question.correctOptions ?? options.flatMap((option, i) => option === question.answer ? [i] : []);
      if (!correct.length || correct.some((i) => !Number.isInteger(i) || i < 0 || i >= options.length)) throw new Error(prefix + "정답을 선택해주세요.");
      if (question.answerType !== "multiple" && correct.length !== 1) throw new Error(prefix + "단일 정답은 하나만 선택해주세요.");
    } else if (parseAnswers(question.answer ?? "", question.answerType === "multiple").some((value) => !normalizeAnswer(value, question.answerMatch).length)) {
      throw new Error(prefix + "비어 있는 정답을 입력할 수 없습니다.");
    }
    const times = new Set<number>();
    for (const hint of question.hints ?? []) {
      if (!hint.content?.trim() || !Number.isInteger(hint.revealTime) || hint.revealTime! < 0 || hint.revealTime! > QUESTION_TIME_LIMIT_MS / 1000 || times.has(hint.revealTime!)) throw new Error(prefix + "힌트 내용과 공개 시간을 확인해주세요.");
      times.add(hint.revealTime!);
    }
  }
}

export function validateTopicImage(file: File) {
  if (!/\.(jpg|png)$/i.test(file.name) || !["image/jpeg", "image/png"].includes(file.type)) throw new Error("jpg, png 이미지만 선택해주세요.");
}

export async function saveTopic(topic: Topic, questions: Question[], image?: File, requestApproval = false): Promise<Topic> {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인 후 이용해주세요.");
  validateTopic(topic, questions);
  if (requestApproval && !questions.length) throw new Error("추가 요청 전에 문제를 추가해주세요.");
  if (image) validateTopicImage(image);
  const topicRef = doc(db, "topics", topic.id);
  const existing = await getDoc(topicRef);
  if (existing.exists() && existing.data().ownerId !== user.uid) throw new Error("본인의 주제만 수정할 수 있습니다.");
  if (existing.exists() && existing.data().updatedAt !== topic.updatedAt) throw new Error("다른 곳에서 수정된 주제입니다. 다시 열어주세요.");
  const oldQuestions = await getDocs(collection(topicRef, "questions"));
  const ids = new Set(questions.map((question) => question.id));
  const removed = oldQuestions.docs.filter((item) => !ids.has(item.id));
  if (questions.length + removed.length + 1 > 500) throw new Error("한 번에 저장할 수 있는 문제 수를 초과했습니다.");
  let imageUrl = topic.imageUrl ?? "";
  let imagePath = topic.imagePath ?? "";
  let uploadedPath: string | undefined;
  try {
    if (image) {
      uploadedPath = `topics/${user.uid}/${topic.id}/${crypto.randomUUID()}.${image.type === "image/png" ? "png" : "jpg"}`;
      const imageRef = ref(getStorage(app), uploadedPath);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);
      imagePath = uploadedPath;
    }
    const saved: Topic = {
      id: topic.id, topicName: topic.topicName, description: topic.description, category: topic.category,
      ownerId: user.uid, imageUrl, imagePath, updatedAt: Date.now(), questionCount: questions.length,
      approvalStatus: "approved",
    };
    await runTransaction(db, async (transaction) => {
      const current = await transaction.get(topicRef);
      if (current.exists() !== existing.exists() || current.data()?.updatedAt !== existing.data()?.updatedAt || (current.exists() && current.data().ownerId !== user.uid)) {
        throw new Error("다른 곳에서 변경된 주제입니다. 다시 열어주세요.");
      }
      transaction.set(topicRef, saved, { merge: true });
      removed.forEach((item) => transaction.delete(item.ref));
      questions.forEach((question, order) => {
        // Firestore/Realtime Database do not accept undefined fields.
        const data = JSON.parse(JSON.stringify({ ...question, order }));
        transaction.set(doc(topicRef, "questions", question.id), data);
      });
    });
    return saved;
  } catch (error) {
    if (uploadedPath) await deleteObject(ref(getStorage(app), uploadedPath)).catch(() => undefined);
    throw error;
  }
}

export async function removeTopic(topic: Topic) {
  const topicRef = doc(db, "topics", topic.id);
  const existing = await getDoc(topicRef);
  if (!auth.currentUser || existing.data()?.ownerId !== auth.currentUser.uid) throw new Error("본인의 주제만 삭제할 수 있습니다.");
  const questions = await getDocs(collection(topicRef, "questions"));
  if (questions.size > 499) throw new Error("한 번에 삭제할 수 있는 문제 수를 초과했습니다.");
  const batch = writeBatch(db);
  questions.docs.forEach((item) => batch.delete(item.ref));
  batch.delete(topicRef);
  await batch.commit();
}
