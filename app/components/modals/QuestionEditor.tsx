"use client";

import { useRef, useState } from "react";

import { Question } from "@/types/topic/topic";
import { isChoiceQuestion, parseAnswers } from "@/utils/answer";
import { CheckIcon } from "@/components/common/icons/CheckIcon";
import { DeleteIcon } from "@/components/common/icons/DeleteIcon";
import { DragIcon } from "@/components/common/icons/DragIcon";
import { HintIcon } from "@/components/common/icons/HintIcon";
import { SettingsIcon } from "@/components/common/icons/SettingsIcon";
import { QuestionHintsDialog } from "./topic/QuestionHintsDialog";
import { QuestionSettingsDialog } from "./topic/QuestionSettingsDialog";

export function QuestionEditor({
  question,
  number,
  onChange,
}: {
  question: Question;
  number: number;
  onChange: (question: Question) => void;
}) {
  const [settings, setSettings] = useState(false);
  const [hints, setHints] = useState(false);

  const [draggingOption, setDraggingOption] = useState<number | null>(null);

  const dragOption = useRef<number | null>(null);
  const dragReady = useRef<number | null>(null);

  const choice = isChoiceQuestion(question);
  const multiple = question.answerType === "multiple";
  const options = question.options ?? [];

  const correct =
    question.correctOptions ??
    options.flatMap((value, index) =>
      value === question.answer ? [index] : [],
    );

  const update = (change: Partial<Question>) => {
    onChange({
      ...question,
      ...change,
    });
  };

  const updateOptions = (values: string[], indices: number[]) => {
    update({
      options: values,
      correctOptions: indices,
      answer: values[indices[0]] ?? "",
    });
  };

  const toggleMultiple = (nextMultiple: boolean) => {
    if (nextMultiple === multiple) {
      return;
    }

    const indices = correct.slice(0, 1);

    update({
      answerType: nextMultiple ? "multiple" : "single",

      ...(choice && !nextMultiple
        ? {
            correctOptions: indices,
            answer: options[indices[0]] ?? "",
          }
        : {}),
    });
  };

  const moveOption = (from: number, to: number) => {
    if (from === to) {
      return;
    }

    if (from < 0 || to < 0 || from >= options.length || to >= options.length) {
      return;
    }

    const entries = options.map((value, index) => ({
      value,
      correct: correct.includes(index),
    }));

    const [moved] = entries.splice(from, 1);

    entries.splice(to, 0, moved);

    updateOptions(
      entries.map((entry) => entry.value),
      entries.flatMap((entry, index) => (entry.correct ? [index] : [])),
    );
  };

  return (
    <>
      <div className="relative h-full min-h-0 flex-1">
        {/* 설정 / 힌트 */}
        <div className="absolute left-0 top-0 flex items-center gap-[12px]">
          <button
            type="button"
            aria-label="퀴즈 설정"
            onClick={() => setSettings(true)}
            className="scale-[0.58]"
          >
            <SettingsIcon />
          </button>

          <button
            type="button"
            aria-label="힌트 분기"
            onClick={() => setHints(true)}
            className="scale-[0.58]"
          >
            <HintIcon />
          </button>
        </div>

        {/* 단일 / 복수 정답 */}
        <div className="absolute right-0 top-0">
          <div className="flex h-[34px] rounded-[8px] bg-zinc-800 p-[3px]">
            <button
              type="button"
              className={`
                rounded-[6px]
                px-[14px]
                text-[14px]
                ${!multiple ? "bg-[#09090B] text-zinc-200" : "text-zinc-500"}
              `}
              onClick={() => toggleMultiple(false)}
            >
              단일 정답
            </button>

            <button
              type="button"
              className={`
                rounded-[6px]
                px-[14px]
                text-[14px]
                ${multiple ? "bg-[#09090B] text-zinc-200" : "text-zinc-500"}
              `}
              onClick={() => toggleMultiple(true)}
            >
              복수 정답
            </button>
          </div>
        </div>

        <div className="flex h-full min-h-0 flex-col items-center pt-[44px]">
          <span className="text-[24px] font-semibold text-zinc-200">
            Q{number}.
          </span>

          <input
            aria-label="문제 제목"
            placeholder="제목을 입력하세요"
            value={question.question}
            onChange={(e) =>
              update({
                question: e.target.value,
              })
            }
            className="
              mt-[20px]
              w-[72%]
              bg-transparent
              text-center
              text-[17px]
              font-medium
              text-zinc-200
              outline-none
              placeholder:text-zinc-600
            "
          />

          {choice ? (
            <div className="mt-[30px] flex min-h-0 w-[84%] flex-1 flex-col">
              <div className="no-scrollbar min-h-0 flex-1 space-y-[10px] overflow-y-auto">
                {options.map((option, index) => {
                  const checked = correct.includes(index);
                  const dragging = draggingOption === index;

                  return (
                    <div
                      key={index}
                      draggable
                      className={`
                        group
                        flex h-[44px]
                        items-center
                        transition-opacity
                        duration-150
                        ${dragging ? "opacity-35" : "opacity-100"}
                      `}
                      onDragStart={(e) => {
                        if (dragReady.current !== index) {
                          e.preventDefault();
                          return;
                        }

                        dragOption.current = index;
                        setDraggingOption(index);

                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(index));

                        /*
                         * 브라우저 기본 drag preview는
                         * 작은 핸들만 잡히는 경우가 있어서
                         * 현재 row 전체를 복제해 drag image로 사용.
                         */
                        const row = e.currentTarget;

                        const ghost = row.cloneNode(true) as HTMLElement;

                        ghost.style.position = "fixed";
                        ghost.style.left = "-10000px";
                        ghost.style.top = "-10000px";
                        ghost.style.width = `${row.offsetWidth}px`;
                        ghost.style.height = `${row.offsetHeight}px`;
                        ghost.style.opacity = "0.55";
                        ghost.style.pointerEvents = "none";
                        ghost.style.zIndex = "99999";

                        document.body.appendChild(ghost);

                        const rect = row.getBoundingClientRect();

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

                        const from = dragOption.current;

                        if (from === null || from === index) {
                          return;
                        }

                        moveOption(from, index);

                        /*
                         * 데이터가 즉시 재정렬되므로,
                         * 현재 drag item의 인덱스 역시 이동 위치로 갱신.
                         */
                        dragOption.current = index;
                        setDraggingOption(index);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();

                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                      }}
                      onDragEnd={() => {
                        dragOption.current = null;
                        dragReady.current = null;

                        setDraggingOption(null);
                      }}
                    >
                      {/* 삭제 */}
                      <div className="flex w-[28px] shrink-0 justify-start">
                        <button
                          type="button"
                          aria-label={`${index + 1}번 보기 삭제`}
                          className="
                            pointer-events-none
                            origin-left
                            scale-[0.56]
                            text-zinc-400
                            opacity-0
                            transition-[color,opacity]
                            duration-150
                            group-hover:pointer-events-auto
                            group-hover:opacity-100
                            hover:!text-red-400
                          "
                          onClick={() =>
                            updateOptions(
                              options.filter(
                                (_, optionIndex) => optionIndex !== index,
                              ),
                              correct
                                .filter(
                                  (correctIndex) => correctIndex !== index,
                                )
                                .map((correctIndex) =>
                                  correctIndex > index
                                    ? correctIndex - 1
                                    : correctIndex,
                                ),
                            )
                          }
                        >
                          <DeleteIcon />
                        </button>
                      </div>

                      {/* 선택지 */}
                      <div
                        className={`
                          flex h-[44px]
                          min-w-0 flex-1
                          items-center
                          rounded-[8px]
                          border
                          transition-colors
                          ${
                            dragging
                              ? "border-zinc-600 bg-zinc-900/40"
                              : "border-zinc-500"
                          }
                        `}
                      >
                        <input
                          aria-label={`${index + 1}번 보기`}
                          value={option}
                          placeholder="내용을 입력하세요"
                          className="
                            min-w-0 flex-1
                            bg-transparent
                            px-[15px]
                            text-[15px]
                            text-zinc-200
                            outline-none
                            placeholder:text-zinc-600
                          "
                          onChange={(e) =>
                            updateOptions(
                              options.map((value, optionIndex) =>
                                optionIndex === index ? e.target.value : value,
                              ),
                              correct,
                            )
                          }
                        />

                        <button
                          type="button"
                          aria-label={`${index + 1}번 보기 정답`}
                          className="
                            mr-[8px]
                            flex h-[25px] w-[25px]
                            shrink-0
                            items-center justify-center
                            rounded-[7px]
                            border border-zinc-400
                          "
                          onClick={() => {
                            if (checked) {
                              updateOptions(
                                options,
                                correct.filter(
                                  (correctIndex) => correctIndex !== index,
                                ),
                              );

                              return;
                            }

                            updateOptions(
                              options,
                              multiple ? [...correct, index] : [index],
                            );
                          }}
                        >
                          {checked && (
                            <span className="scale-[0.65]">
                              <CheckIcon />
                            </span>
                          )}
                        </button>
                      </div>

                      {/* 드래그 */}
                      <div className="flex w-[24px] shrink-0 justify-end">
                        <button
                          type="button"
                          aria-label={`${index + 1}번 보기 이동`}
                          className="
                            pointer-events-none
                            origin-right
                            scale-[0.52]
                            cursor-grab
                            opacity-0
                            transition-opacity
                            duration-150
                            group-hover:pointer-events-auto
                            group-hover:opacity-100
                            active:cursor-grabbing
                          "
                          onPointerDown={() => {
                            dragReady.current = index;
                          }}
                          onPointerUp={() => {
                            if (dragOption.current === null) {
                              dragReady.current = null;
                            }
                          }}
                          onPointerCancel={() => {
                            if (dragOption.current === null) {
                              dragReady.current = null;
                            }
                          }}
                        >
                          <DragIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 선택지 추가 */}
                <div className="flex h-[44px] items-center">
                  <div className="w-[28px] shrink-0" />

                  <button
                    type="button"
                    className="
                      h-[44px]
                      min-w-0 flex-1
                      rounded-[8px]
                      border border-dashed border-zinc-600
                      text-[20px]
                      text-zinc-500
                      transition-colors
                      hover:border-zinc-500
                      hover:text-zinc-400
                    "
                    onClick={() => updateOptions([...options, ""], correct)}
                  >
                    +
                  </button>

                  <div className="w-[24px] shrink-0" />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-[30px] w-[74%]">
              <input
                aria-label="주관식 정답"
                value={question.answer ?? ""}
                placeholder="정답을 입력하세요"
                onChange={(e) =>
                  update({
                    answer: e.target.value,
                  })
                }
                className="
                  h-[44px]
                  w-full
                  rounded-[8px]
                  border border-zinc-500
                  bg-transparent
                  px-[15px]
                  text-[15px]
                  text-zinc-200
                  outline-none
                  placeholder:text-zinc-600
                "
              />

              {multiple && (
                <div
                  aria-label="인식되는 정답"
                  className="
                    mt-[10px]
                    flex flex-wrap
                    gap-[6px]
                    text-[12px]
                    text-zinc-500
                  "
                >
                  {parseAnswers(question.answer ?? "", true).map(
                    (value, index) => (
                      <span
                        key={index}
                        className="
                        whitespace-pre-wrap
                        rounded-[5px]
                        border border-zinc-700
                        px-[7px]
                        py-[4px]
                      "
                      >
                        [{value.replace(/\s/g, "·")}]
                      </span>
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <QuestionSettingsDialog
        open={settings}
        onOpenChange={setSettings}
        question={question}
        onChange={update}
      />

      <QuestionHintsDialog
        open={hints}
        onOpenChange={setHints}
        hints={question.hints ?? []}
        onChange={(value) => update({ hints: value })}
      />
    </>
  );
}
