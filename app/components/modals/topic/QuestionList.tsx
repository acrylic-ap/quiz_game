"use client";

import { useRef, useState } from "react";

import { Question } from "@/types/topic/topic";
import { isChoiceQuestion } from "@/utils/answer";

const DeleteIcon = () => (
  <svg
    width="21"
    height="26"
    viewBox="0 0 21 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.75 2.08333H15L13.6429 0.75H6.85714L5.5 2.08333H0.75V4.75H19.75M2.10714 22.0833C2.10714 22.7906 2.39311 23.4689 2.90214 23.969C3.41117 24.469 4.10155 24.75 4.82143 24.75H15.6786C16.3984 24.75 17.0888 24.469 17.5979 23.969C18.1069 23.4689 18.3929 22.7906 18.3929 22.0833V6.75H2.10714V22.0833Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const DragIcon = () => (
  <svg
    width="17"
    height="27"
    viewBox="0 0 17 27"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 2.3143C0 3.59245 1.03615 4.6286 2.3143 4.6286C3.59245 4.6286 4.6286 3.59245 4.6286 2.3143C4.6286 1.03615 3.59245 0 2.3143 0C1.03615 0 0 1.03615 0 2.3143Z"
      fill="#71717A"
    />
    <path
      d="M12.0281 2.3143C12.0281 3.59245 13.0643 4.6286 14.3424 4.6286C15.6206 4.6286 16.6567 3.59245 16.6567 2.3143C16.6567 1.03615 15.6206 0 14.3424 0C13.0643 0 12.0281 1.03615 12.0281 2.3143Z"
      fill="#71717A"
    />
    <path
      d="M0 13.1143C0 14.3925 1.03615 15.4286 2.3143 15.4286C3.59245 15.4286 4.6286 14.3925 4.6286 13.1143C4.6286 11.8362 3.59245 10.8 2.3143 10.8C1.03615 10.8 0 11.8362 0 13.1143Z"
      fill="#71717A"
    />
    <path
      d="M12.0281 13.1143C12.0281 14.3925 13.0643 15.4286 14.3424 15.4286C15.6206 15.4286 16.6567 14.3925 16.6567 13.1143C16.6567 11.8362 15.6206 10.8 14.3424 10.8C13.0643 10.8 12.0281 11.8362 12.0281 13.1143Z"
      fill="#71717A"
    />
    <path
      d="M0 24.6856C0 25.9638 1.03615 26.9999 2.3143 26.9999C3.59245 26.9999 4.6286 25.9638 4.6286 24.6856C4.6286 23.4075 3.59245 22.3713 2.3143 22.3713C1.03615 22.3713 0 23.4075 0 24.6856Z"
      fill="#71717A"
    />
    <path
      d="M12.0286 24.6856C12.0286 25.9638 13.0648 26.9999 14.3429 26.9999C15.6211 26.9999 16.6572 25.9638 16.6572 24.6856C16.6572 23.4075 15.6211 22.3713 14.3429 22.3713C13.0648 22.3713 12.0286 23.4075 12.0286 24.6856Z"
      fill="#71717A"
    />
  </svg>
);

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
