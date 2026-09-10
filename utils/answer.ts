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

export const matchesAnswer = (question: Question, answer: string | null) => {
  if (answer === null) return false;
  if (isChoiceQuestion(question)) {
    const candidates = question.correctOptions
      ? question.correctOptions.map((index) => question.options?.[index])
      : [question.answer];
    return candidates.some((candidate) => candidate !== undefined && candidate === answer);
  }
  if (question.answer === undefined) return false;
  return parseAnswers(question.answer, question.answerType === "multiple").some(
    (candidate) => normalizeAnswer(candidate, question.answerMatch) === normalizeAnswer(answer, question.answerMatch),
  );
};
