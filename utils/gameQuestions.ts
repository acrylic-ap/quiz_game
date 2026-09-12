import { Question } from "@/types/topic/topic";
import { getCorrectOptionIndices, isChoiceQuestion, normalizeQuestionAnswerType } from "@/utils/answer";
import { shuffle } from "@/utils/random";

// 호스트가 한 번 구성한 순서를 RTDB로 공유한다. 원본 편집 데이터는 변경하지 않는다.
export const buildGameQuestionList = (questions: Question[], lastRound: number): Question[] =>
  shuffle(questions).slice(0, Math.min(lastRound, questions.length)).map((question) => {
    if (!isChoiceQuestion(question) || !question.options) return { ...question };
    const correct = new Set(getCorrectOptionIndices(question));
    const entries = shuffle(question.options.map((value, index) => ({
      value,
      correct: correct.has(index),
    })));
    return {
      ...normalizeQuestionAnswerType(question),
      options: entries.map((entry) => entry.value),
      correctOptions: entries.flatMap((entry, index) => entry.correct ? [index] : []),
    };
  });
