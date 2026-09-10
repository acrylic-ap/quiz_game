import { test } from "node:test";
import assert from "node:assert/strict";
import { Question } from "@/types/topic/topic";
import { isChoiceQuestion, matchesAnswer, normalizeAnswer, parseAnswers } from "./answer";

const question: Question = { id: "q", question: "문제", type: "text", questionType: "input", answerType: "single", answerMatch: "exact", answer: " 사자" };

test("일치는 앞뒤 공백과 대소문자를 그대로 비교한다", () => {
  assert.equal(matchesAnswer(question, " 사자"), true);
  assert.equal(matchesAnswer(question, "사자"), false);
  assert.equal(matchesAnswer({ ...question, answer: "ABC" }, "abc"), false);
  assert.equal(matchesAnswer({ ...question, answer: "안 녕 " }, "안 녕"), false);
  assert.equal(matchesAnswer({ ...question, answer: " " }, " "), true);
  assert.equal(matchesAnswer(question, null), false);
});

test("띄어쓰기 무시는 모든 whitespace만 제거하며 원본을 변경하지 않는다", () => {
  const original = { ...question, answer: " 안\t녕\n\u00a0", answerMatch: "ignoreWhitespace" as const };
  for (const input of ["안녕", " 안녕 ", "안 녕", "안   녕", "\t안\n녕\u00a0"]) assert.equal(matchesAnswer(original, input), true);
  assert.equal(original.answer, " 안\t녕\n\u00a0");
  assert.equal(normalizeAnswer(" A B ", "ignoreWhitespace"), "AB");
  assert.equal(matchesAnswer({ ...original, answer: "ABC" }, "abc"), false);
});

test("복수 정답은 쉼표로만 분리하고 후보 하나가 일치하면 정답이다", () => {
  assert.deepEqual(parseAnswers("감자, 사자,호랑이 ", true), ["감자", " 사자", "호랑이 "]);
  const multiple = { ...question, answer: "감자, 사자", answerType: "multiple" };
  assert.equal(matchesAnswer(multiple, "감자"), true);
  assert.equal(matchesAnswer(multiple, " 사자"), true);
  assert.equal(matchesAnswer(multiple, "사자"), false);
  assert.equal(matchesAnswer({ ...multiple, answerMatch: "ignoreWhitespace" }, "사자"), true);
  assert.deepEqual(parseAnswers("감자,,", true), ["감자", "", ""]);
  assert.deepEqual(parseAnswers("감자, 사자", false), ["감자, 사자"]);
});

test("주관식 단일 정답은 객관식으로 분류되지 않는다", () => {
  assert.equal(isChoiceQuestion(question), false);
  assert.equal(isChoiceQuestion({ ...question, options: ["기존 보기"] }), false);
  assert.equal(isChoiceQuestion({ ...question, questionType: undefined, options: ["보기"] }), true);
});

test("객관식 복수 정답과 기존 단일 정답을 모두 채점한다", () => {
  const choice = { ...question, questionType: "choice", options: ["A,B", " B", "C"], correctOptions: [0, 1], answerType: "multiple" };
  assert.equal(matchesAnswer(choice, "A,B"), true);
  assert.equal(matchesAnswer(choice, " B"), true);
  assert.equal(matchesAnswer(choice, "B"), false);
  assert.equal(matchesAnswer(choice, "C"), false);
  assert.equal(matchesAnswer({ ...choice, correctOptions: undefined, answer: "C" }, "C"), true);
});
