import { Question } from "@/types/topic/topic";

export const isChoiceQuestion = (question: Question) => {
  if (question.questionType) {
    return question.questionType === "choice" || question.questionType === "select";
  }
  return (question.options?.length ?? 0) > 0;
};

export const parseAnswers = (answer: string, multiple: boolean) =>
  multiple ? answer.split(",") : [answer];

export const normalizeAnswer = (answer: string, mode: Question["answerMatch"]) =>
  mode === "ignoreWhitespace" ? answer.replace(/\s/g, "") : answer;

export const getCorrectOptionIndices = (question: Question): number[] =>
  question.correctOptions ??
  (question.options ?? []).flatMap((option, index) =>
    option === question.answer ? [index] : [],
  );

export const getChoiceAnswerMode = (question: Question): "single" | "all" | "any" =>
  getCorrectOptionIndices(question).length <= 1
    ? "single"
    : question.answerType === "any" ? "any" : "all";

export const normalizeQuestionAnswerType = (question: Question): Question =>
  isChoiceQuestion(question)
    ? { ...question, answerType: getChoiceAnswerMode(question) === "any" ? "any" : "all" }
    : question;

export const matchesAnswer = (question: Question, answer: string | number | number[] | null | undefined) => {
  if (answer == null) return false;
  if (isChoiceQuestion(question)) {
    const options = question.options ?? [];
    // 이전 게임의 문자열 제출도 단일 선택으로 읽는다.
    const selected = Array.isArray(answer) ? answer :
      [typeof answer === "number" ? answer : options.indexOf(answer)];
    if (selected.some((index) =>
      !Number.isInteger(index) || index < 0 || index >= options.length
    )) return false;
    const expected = new Set(getCorrectOptionIndices(question));
    const actual = new Set(selected);
    if (getChoiceAnswerMode(question) !== "all") {
      return actual.size === 1 && [...actual].every((index) => expected.has(index));
    }
    return expected.size > 0 && actual.size === expected.size &&
      [...actual].every((index) => expected.has(index));
  }
  if (typeof answer !== "string" || question.answer === undefined) return false;
  return parseAnswers(question.answer, question.answerType === "multiple").some(
    (candidate) => normalizeAnswer(candidate, question.answerMatch) === normalizeAnswer(answer, question.answerMatch),
  );
};
