"use client";

import { useRef, useState } from "react";

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

import { Hint, Question } from "@/types/topic/topic";
import { isChoiceQuestion, parseAnswers } from "@/utils/answer";
import { QUESTION_TIME_LIMIT_MS } from "@/utils/game";

const SettingsIcon = () => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M30.3855 18.0559C30.1243 17.764 29.9803 17.3886 29.9803 17C29.9803 16.6115 30.1243 16.2361 30.3855 15.9441L32.47 13.6405C32.6997 13.3888 32.8423 13.0721 32.8775 12.7358C32.9126 12.3995 32.8384 12.061 32.6655 11.7687L29.4082 6.23347C29.2372 5.94154 28.9765 5.71015 28.6636 5.57225C28.3506 5.43437 28.0015 5.39704 27.6657 5.46557L24.6039 6.0735C24.2144 6.15257 23.8087 6.08883 23.4638 5.89432C23.1186 5.6998 22.8581 5.38796 22.7311 5.01763L21.7376 2.09003C21.6283 1.77228 21.4202 1.49629 21.1425 1.30108C20.865 1.10587 20.5318 1.00131 20.1904 1.00218H13.6761C13.321 0.983967 12.9695 1.08045 12.6754 1.27688C12.3813 1.47332 12.1608 1.7589 12.0475 2.09003L11.1355 5.01763C11.0084 5.38796 10.7478 5.6998 10.4028 5.89432C10.0578 6.08883 9.65217 6.15257 9.26259 6.0735L6.1194 5.46557C5.8011 5.42138 5.47659 5.47073 5.18678 5.60738C4.89697 5.74403 4.65481 5.96188 4.49081 6.23347L1.23362 11.7687C1.05637 12.0577 0.976667 12.3944 1.00592 12.7305C1.03517 13.0667 1.17187 13.3852 1.39648 13.6405L3.4648 15.9441C3.7259 16.2361 3.86988 16.6115 3.86988 17C3.86988 17.3886 3.7259 17.764 3.4648 18.0559L1.39648 20.3595C1.17187 20.6148 1.03517 20.9333 1.00592 21.2694C0.976667 21.6057 1.05637 21.9423 1.23362 22.2313L4.49081 27.7666C4.66197 28.0585 4.92259 28.2899 5.23548 28.4277C5.54839 28.5657 5.89763 28.603 6.2334 28.5344L9.29516 27.9266C9.68475 27.8474 10.0903 27.9112 10.4354 28.1058C10.7804 28.3002 11.041 28.6121 11.168 28.9824L12.1615 31.9101C12.2748 32.2411 12.4953 32.5267 12.7894 32.7231C13.0835 32.9195 13.435 33.016 13.79 32.9978H20.3045C20.6459 32.9987 20.979 32.8942 21.2566 32.699C21.5342 32.5038 21.7424 32.2277 21.8516 31.9101L22.845 28.9824C22.9721 28.6121 23.2327 28.3002 23.5777 28.1058C23.9228 27.9112 24.3284 27.8474 24.7179 27.9266L27.7797 28.5344C28.1154 28.603 28.4647 28.5657 28.7776 28.4277C29.0905 28.2899 29.3511 28.0585 29.5223 27.7666L32.7795 22.2313C32.9524 21.9391 33.0266 21.6005 32.9915 21.2643C32.9564 20.928 32.8138 20.6112 32.584 20.3595L30.3855 18.0559ZM16.9333 10.6009C15.6448 10.6009 14.3854 10.9762 13.3141 11.6793C12.2428 12.3825 11.4078 13.3819 10.9148 14.5512C10.4217 15.7205 10.2927 17.0072 10.5441 18.2484C10.7954 19.4897 11.4159 20.6299 12.3269 21.5249C13.238 22.4198 14.3986 23.0293 15.6624 23.2762C16.926 23.5231 18.2358 23.3963 19.4262 22.912C20.6165 22.4277 21.634 21.6075 22.3498 20.5552C23.0656 19.5029 23.4476 18.2656 23.4476 17C23.4476 15.3029 22.7614 13.6752 21.5396 12.4751C20.3179 11.2751 18.6609 10.6009 16.9333 10.6009Z"
      stroke="#A1A1AA"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HintIcon = () => (
  <svg
    width="25"
    height="37"
    viewBox="0 0 25 37"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.60393 28.832H18.3801C18.9332 28.832 19.2747 28.4965 19.2747 27.953V25.3959C19.2747 21.528 25 19.035 25 12.1306C25 4.85864 19.9901 0 12.4917 0C4.9932 0 0 4.85864 0 12.1313C0 19.035 5.70939 21.528 5.70939 25.3959V27.953C5.70939 28.4965 6.06679 28.832 6.60393 28.832ZM8.13277 25.4286C8.13277 20.7302 2.456 18.2208 2.456 12.1476C2.456 6.29748 6.47416 2.41398 12.4917 2.41398C18.5099 2.41398 22.544 6.29748 22.544 12.1476C22.544 18.2208 16.8513 20.7302 16.8513 25.4286V26.4194H8.13277V25.4286ZM7.20561 33.1479H17.7784C18.6077 33.1479 19.2747 32.4769 19.2747 31.6456C19.2747 30.8144 18.6077 30.1434 17.7777 30.1434H7.20561C6.3763 30.1434 5.70939 30.815 5.70939 31.6456C5.70939 32.4775 6.37561 33.1479 7.20561 33.1479ZM12.4917 37C14.7367 37 16.3141 35.9928 16.4765 34.4428H8.50683C8.65326 35.9928 10.2307 37 12.4917 37Z"
      fill="#A1A1AA"
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

const CheckIcon = () => (
  <svg
    width="16"
    height="12"
    viewBox="0 0 16 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 6L6.25 11L15 1"
      stroke="#E4E4E7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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

      {/* 퀴즈 설정 */}
      <Dialog open={settings} onOpenChange={setSettings}>
        <DialogContent
          className="
            w-[420px]
            border-zinc-700
            bg-[#09090B]
            text-zinc-100
          "
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>퀴즈 설정</DialogTitle>
          </DialogHeader>

          <div className="space-y-[18px]">
            <label className="block space-y-[8px]">
              <span className="text-[15px] text-zinc-400">지문 형식</span>

              <Select
                value={question.type}
                onValueChange={(type) =>
                  update({
                    type,
                  })
                }
              >
                <SelectTrigger className="w-full text-[14px]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="text">텍스트</SelectItem>

                  <SelectItem value="image" disabled>
                    사진
                  </SelectItem>

                  <SelectItem value="sound" disabled>
                    소리
                  </SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="block space-y-[8px]">
              <span className="text-[15px] text-zinc-400">문제 유형</span>

              <Select
                value={choice ? "choice" : "input"}
                onValueChange={(questionType) =>
                  update({
                    questionType,
                    answer: "",
                    options: questionType === "choice" ? ["", ""] : [],
                    correctOptions: [],
                    answerType: "single",
                    answerMatch: question.answerMatch ?? "exact",
                  })
                }
              >
                <SelectTrigger className="w-full text-[14px]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="choice">객관식</SelectItem>

                  <SelectItem value="input">주관식</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="block space-y-[8px]">
              <span className="text-[15px] text-zinc-400">난이도</span>

              <Select
                value={String(question.difficulty ?? 3)}
                onValueChange={(value) =>
                  update({
                    difficulty: Number(value),
                  })
                }
              >
                <SelectTrigger className="w-full text-[14px]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            {!choice && (
              <label className="block space-y-[8px]">
                <span className="text-[15px] text-zinc-400">인정 범위</span>

                <Select
                  value={question.answerMatch ?? "exact"}
                  onValueChange={(value: "exact" | "ignoreWhitespace") =>
                    update({
                      answerMatch: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full text-[14px]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="exact">일치</SelectItem>

                    <SelectItem value="ignoreWhitespace">
                      띄어쓰기 무시
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 힌트 */}
      <Dialog open={hints} onOpenChange={setHints}>
        <DialogContent
          className="
            w-[560px]
            border-zinc-700
            bg-[#09090B]
            text-zinc-100
          "
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>힌트 분기</DialogTitle>
          </DialogHeader>

          <HintTimeline
            hints={question.hints ?? []}
            onChange={(value) =>
              update({
                hints: value,
              })
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function HintTimeline({
  hints,
  onChange,
}: {
  hints: Hint[];
  onChange: (hints: Hint[]) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const [dragging, setDragging] = useState<string | null>(null);

  const track = useRef<HTMLDivElement>(null);

  const limit = QUESTION_TIME_LIMIT_MS / 1000;

  const active = hints.find((hint) => hint.id === selected);

  const timeAt = (clientX: number) => {
    const bounds = track.current!.getBoundingClientRect();

    return Math.round(
      limit *
        (1 - Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width))),
    );
  };

  const move = (id: string, time: number) => {
    if (hints.some((hint) => hint.id !== id && hint.revealTime === time)) {
      return;
    }

    onChange(
      hints.map((hint) =>
        hint.id === id
          ? {
              ...hint,
              revealTime: time,
            }
          : hint,
      ),
    );
  };

  return (
    <div className="pt-[12px]">
      <div className="flex justify-between text-[14px] text-zinc-500">
        <span>{limit}초</span>
        <span>0초</span>
      </div>

      <div
        ref={track}
        className="
          relative
          my-[24px]
          h-[30px]
          cursor-pointer
          touch-none
        "
        onPointerDown={(e) => {
          if (e.button !== 0) {
            return;
          }

          const revealTime = timeAt(e.clientX);

          if (hints.some((hint) => hint.revealTime === revealTime)) {
            return;
          }

          const id = crypto.randomUUID();

          onChange([
            ...hints,
            {
              id,
              content: "",
              revealTime,
            },
          ]);

          setSelected(id);
        }}
      >
        <div
          className="
            pointer-events-none
            absolute
            top-1/2
            h-[3px]
            w-full
            -translate-y-1/2
            bg-zinc-700
          "
        />

        {hints.map((hint) => (
          <button
            key={hint.id}
            role="slider"
            aria-label="힌트 공개 시간"
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-valuenow={hint.revealTime ?? 0}
            className={`
              absolute
              top-1/2
              h-[14px]
              w-[14px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              touch-none
              ${selected === hint.id ? "bg-zinc-100" : "bg-zinc-500"}
            `}
            style={{
              left: `${(1 - (hint.revealTime ?? 0) / limit) * 100}%`,
            }}
            onFocus={() => setSelected(hint.id)}
            onPointerDown={(e) => {
              e.stopPropagation();

              if (e.button !== 0) {
                return;
              }

              setSelected(hint.id);

              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId) && e.buttons) {
                setDragging(hint.id);

                move(hint.id, timeAt(e.clientX));
              }
            }}
            onPointerUp={(e) => {
              e.currentTarget.releasePointerCapture(e.pointerId);

              setDragging(null);
            }}
            onPointerCancel={() => setDragging(null)}
            onLostPointerCapture={() => setDragging(null)}
          >
            {dragging === hint.id && (
              <span
                className="
                  absolute
                  left-1/2
                  top-[20px]
                  -translate-x-1/2
                  whitespace-nowrap
                  text-[13px]
                  text-zinc-100
                "
              >
                {hint.revealTime}초
              </span>
            )}
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-[32px] flex items-start gap-[10px]">
          <textarea
            aria-label="힌트 내용"
            value={active.content ?? ""}
            placeholder="힌트 내용을 입력하세요"
            onChange={(e) =>
              onChange(
                hints.map((hint) =>
                  hint.id === selected
                    ? {
                        ...hint,
                        content: e.target.value,
                      }
                    : hint,
                ),
              )
            }
            className="
              min-h-[100px]
              flex-1
              resize-none
              rounded-[9px]
              border border-zinc-700
              bg-[#09090B]
              px-[14px]
              py-[12px]
              text-[15px]
              text-zinc-200
              outline-none
              placeholder:text-zinc-600
            "
          />

          <button
            type="button"
            aria-label="힌트 삭제"
            className="
              mt-[8px]
              scale-[0.6]
              text-zinc-400
              transition-colors
              hover:text-red-400
            "
            onClick={() => {
              onChange(hints.filter((hint) => hint.id !== selected));

              setSelected(null);
            }}
          >
            <DeleteIcon />
          </button>
        </div>
      )}
    </div>
  );
}
