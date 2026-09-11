"use client";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Question } from "@/types/topic/topic";
import { isChoiceQuestion } from "@/utils/answer";
export function QuestionList({
  questions,
  selected,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: {
  questions: Question[];
  selected: string | null;
  onSelect: (id: string) => void;
  onAdd: (question: Question) => void;
  onDelete: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}) {
  const drag = { current: null as number | null };
  return (
    <div className="w-1/3 min-w-0 space-y-3 border-r border-zinc-700 pr-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>총 {questions.length}문항</span>
        <button
          className="flex items-center"
          onClick={() =>
            onAdd({
              id: crypto.randomUUID(),
              question: "",
              type: "text",
              questionType: "choice",
              answerType: "single",
              answerMatch: "exact",
              options: ["", ""],
              correctOptions: [],
              answer: "",
              difficulty: 3,
              hints: [],
            })
          }
        >
          <Plus size={16} />
          문제 추가
        </button>
      </div>
      <div className="max-h-96 space-y-2 overflow-y-auto">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={`flex items-center gap-2 rounded p-2 ${selected === question.id ? "bg-zinc-800" : "bg-zinc-900"}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (drag.current !== null) onReorder(drag.current, index);
              drag.current = null;
            }}
          >
            <button
              draggable
              aria-label={`${index + 1}번 문제 이동`}
              onDragStart={() => {
                drag.current = index;
              }}
              onDragEnd={() => {
                drag.current = null;
              }}
              onKeyDown={(e) => {
                if (e.altKey && ["ArrowUp", "ArrowDown"].includes(e.key)) {
                  e.preventDefault();
                  onReorder(index, index + (e.key === "ArrowUp" ? -1 : 1));
                }
              }}
            >
              <GripVertical size={16} />
            </button>
            <button
              className="min-w-0 flex-1 text-left"
              onClick={() => onSelect(question.id)}
            >
              <div className="truncate">
                {index + 1}. {question.question}
              </div>
              <span className="text-xs text-zinc-400">
                {question.type === "text"
                  ? "텍스트"
                  : question.type === "image"
                    ? "사진"
                    : "소리"}{" "}
                · {isChoiceQuestion(question) ? "객관식" : "주관식"}
              </span>
            </button>
            <button
              aria-label={`${index + 1}번 문제 삭제`}
              onClick={() => onDelete(question.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
