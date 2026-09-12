"use client";

import { useRef, useState } from "react";

import { Question } from "@/types/topic/topic";
import { isChoiceQuestion } from "@/utils/answer";

import { DeleteIcon } from "@/components/common/icons/DeleteIcon";
import { DragIcon } from "@/components/common/icons/DragIcon";

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
  const dragIndex = useRef<number | null>(null);
  const dragReady = useRef<string | null>(null);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const addQuestion = () => {
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
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between pb-[20px]">
        <span className="text-[15px] text-zinc-400">
          총 {questions.length}문항
        </span>

        <button
          type="button"
          className="text-[14px] text-[#93C5FD] transition-colors hover:text-[#BFDBFE]"
          onClick={addQuestion}
        >
          + 문제 추가
        </button>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 space-y-[10px] overflow-y-auto pr-[4px]">
        {questions.map((question, index) => {
          const isSelected = selected === question.id;
          const isDragging = draggingId === question.id;

          return (
            <div
              key={question.id}
              draggable
              className={`
                flex h-[66px] w-full items-center
                rounded-[8px] border px-[16px]
                transition-[border-color,background-color,opacity]
                duration-150
                ${isSelected ? "border-zinc-400" : "border-zinc-700"}
                ${isDragging ? "bg-zinc-900/40 opacity-35" : "opacity-100"}
              `}
              onDragStart={(e) => {
                if (dragReady.current !== question.id) {
                  e.preventDefault();
                  return;
                }

                dragIndex.current = index;
                setDraggingId(question.id);

                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", question.id);

                /*
                 * 드래그 중 마우스를 따라오는 preview도
                 * 핸들 하나가 아니라 카드 전체를 사용.
                 */
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();

                const ghost = card.cloneNode(true) as HTMLElement;

                ghost.style.position = "fixed";
                ghost.style.left = "-10000px";
                ghost.style.top = "-10000px";
                ghost.style.width = `${rect.width}px`;
                ghost.style.height = `${rect.height}px`;
                ghost.style.opacity = "0.55";
                ghost.style.pointerEvents = "none";
                ghost.style.zIndex = "99999";

                document.body.appendChild(ghost);

                const offsetX = Math.max(
                  0,
                  Math.min(rect.width, e.clientX - rect.left),
                );

                const offsetY = Math.max(
                  0,
                  Math.min(rect.height, e.clientY - rect.top),
                );

                e.dataTransfer.setDragImage(ghost, offsetX, offsetY);

                requestAnimationFrame(() => {
                  ghost.remove();
                });
              }}
              onDragEnter={(e) => {
                e.preventDefault();

                const from = dragIndex.current;

                if (from === null || from === index) {
                  return;
                }

                /*
                 * drop을 기다리지 않고 바로 재정렬.
                 * 그래서 다른 카드가 실시간으로 밀려남.
                 */
                onReorder(from, index);

                dragIndex.current = index;
              }}
              onDragOver={(e) => {
                e.preventDefault();

                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
              }}
              onDragEnd={() => {
                dragIndex.current = null;
                dragReady.current = null;

                setDraggingId(null);
              }}
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center text-left"
                onClick={() => onSelect(question.id)}
              >
                <span
                  className={`
                    w-[40px]
                    shrink-0
                    text-[18px]
                    font-semibold
                    ${isSelected ? "text-zinc-200" : "text-zinc-400"}
                  `}
                >
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={`
                      truncate
                      text-[16px]
                      font-medium
                      ${isSelected ? "text-zinc-200" : "text-zinc-300"}
                    `}
                  >
                    {question.question || "제목 없음"}
                  </p>

                  <div className="mt-[3px] flex items-center text-[13px] text-zinc-500">
                    <span>
                      {isChoiceQuestion(question) ? "객관식" : "주관식"}
                    </span>

                    <span className="mx-[9px] h-[12px] w-px bg-zinc-700" />

                    <span>
                      {question.answerType === "multiple"
                        ? "복수 정답"
                        : "단일 정답"}
                    </span>
                  </div>
                </div>
              </button>

              <div className="ml-[12px] flex shrink-0 items-center gap-[10px]">
                {/* 삭제 */}
                <button
                  type="button"
                  aria-label={`${index + 1}번 문제 삭제`}
                  className="
                    origin-center
                    scale-[0.6]
                    text-zinc-300
                    opacity-80
                    transition-[color,opacity]
                    hover:text-red-400
                    hover:opacity-100
                  "
                  onClick={() => onDelete(question.id)}
                >
                  <DeleteIcon />
                </button>

                {/* drag handle */}
                <button
                  type="button"
                  aria-label={`${index + 1}번 문제 이동`}
                  className="
                    origin-center
                    scale-[0.56]
                    cursor-grab
                    opacity-80
                    transition-opacity
                    hover:opacity-100
                    active:cursor-grabbing
                  "
                  onPointerDown={() => {
                    dragReady.current = question.id;
                  }}
                  onPointerUp={() => {
                    if (dragIndex.current === null) {
                      dragReady.current = null;
                    }
                  }}
                  onPointerCancel={() => {
                    if (dragIndex.current === null) {
                      dragReady.current = null;
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.altKey && ["ArrowUp", "ArrowDown"].includes(e.key)) {
                      e.preventDefault();

                      onReorder(index, index + (e.key === "ArrowUp" ? -1 : 1));
                    }
                  }}
                >
                  <DragIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
