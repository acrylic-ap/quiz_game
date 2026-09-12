"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Question } from "@/types/topic/topic";
import { isChoiceQuestion } from "@/utils/answer";

const difficultyLabel: Record<number, string> = {
  1: "매우 쉬움",
  2: "쉬움",
  3: "보통",
  4: "어려움",
  5: "매우 어려움",
};

const selectTriggerClass =
  "h-[68px] w-full rounded-[8px] border-zinc-600 px-[18px] text-[16px] font-normal text-zinc-400";

const selectContentClass =
  "w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]";

export function QuestionSettingsDialog({
  open,
  onOpenChange,
  question,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question;
  onChange: (change: Partial<Question>) => void;
}) {
  const choice = isChoiceQuestion(question);
  const difficulty = question.difficulty ?? 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[510px]
          max-w-[510px]
          rounded-[16px]
          border-zinc-700
          bg-[#09090B]
          px-[62px]
          pt-[40px]
          pb-[48px]
          text-zinc-100
        "
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-[24px] font-semibold">
            퀴즈 설정
          </DialogTitle>
        </DialogHeader>

        <div className="mt-[42px] space-y-[24px]">
          <Select
            value={question.type}
            onValueChange={(type) => onChange({ type })}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue>
                {question.type === "text"
                  ? "텍스트(지문 형식)"
                  : question.type === "image"
                    ? "사진(지문 형식)"
                    : "소리(지문 형식)"}
              </SelectValue>
            </SelectTrigger>

            <SelectContent position="popper" className={selectContentClass}>
              <SelectItem value="text">텍스트</SelectItem>
              <SelectItem value="image" disabled>
                사진
              </SelectItem>
              <SelectItem value="sound" disabled>
                소리
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={choice ? "choice" : "input"}
            onValueChange={(questionType) =>
              onChange({
                questionType,
                answer: "",
                options: questionType === "choice" ? ["", ""] : [],
                correctOptions: [],
                answerType: questionType === "choice" ? "all" : "single",
                answerMatch: question.answerMatch ?? "exact",
              })
            }
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue>
                {choice ? "다지선다(문제 유형)" : "주관식(문제 유형)"}
              </SelectValue>
            </SelectTrigger>

            <SelectContent position="popper" className={selectContentClass}>
              <SelectItem value="choice">다지선다</SelectItem>
              <SelectItem value="input">주관식</SelectItem>
            </SelectContent>
          </Select>

          {!choice && (
            <Select
              value={question.answerMatch ?? "exact"}
              onValueChange={(value: "exact" | "ignoreWhitespace") =>
                onChange({ answerMatch: value })
              }
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue>
                  {(question.answerMatch ?? "exact") === "exact"
                    ? "일치(인정 범위)"
                    : "띄어쓰기 무시(인정 범위)"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent position="popper" className={selectContentClass}>
                <SelectItem value="exact">일치</SelectItem>
                <SelectItem value="ignoreWhitespace">띄어쓰기 무시</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select
            value={String(difficulty)}
            onValueChange={(value) => onChange({ difficulty: Number(value) })}
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue>{difficultyLabel[difficulty]}(난이도)</SelectValue>
            </SelectTrigger>

            <SelectContent position="popper" className={selectContentClass}>
              {[1, 2, 3, 4, 5].map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {difficultyLabel[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
}
