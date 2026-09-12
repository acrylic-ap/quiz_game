"use client";

import { useEffect, useRef, useState } from "react";
import { CornerDownLeft, Volume2 } from "lucide-react";

import { useGamePlayActions } from "@/hooks/queries/game/actions/useGamePlayActions";
import { Game } from "@/types/game/game";
import { Question } from "@/types/topic/topic";
import { isChoiceQuestion } from "@/utils/answer";
import { getVisibleHints } from "@/utils/game";

import { GameUser } from "./types";
import { useRemainingSeconds } from "./useRemainingSeconds";
import { WaitingView } from "./WaitingView";

interface QuestionViewProps {
  roomId: string;
  userId: string;
  users: GameUser[];
  game: Game;
  question: Question;
}

export const QuestionView = ({
  roomId,
  userId,
  users,
  game,
  question,
}: QuestionViewProps) => {
  const { startQuestion, submitAnswer, submitTimeout } = useGamePlayActions(
    roomId,
    userId,
  );

  const [answer, setAnswer] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const player = game.round?.players?.[userId];
  const submission = game.round?.submissions?.[userId];

  const remainingSeconds = useRemainingSeconds(player?.deadlineAt);

  useEffect(() => {
    if (!player) {
      void startQuestion();
    }
  }, [player, startQuestion]);

  useEffect(() => {
    if (!player || submission) {
      return;
    }

    const remainingTime = Math.max(0, player.deadlineAt - Date.now());

    const timer = window.setTimeout(() => {
      void submitTimeout(player);
    }, remainingTime);

    return () => {
      window.clearTimeout(timer);
    };
  }, [player, submission, submitTimeout]);

  useEffect(() => {
    if (question.type !== "sound") {
      return;
    }

    // TODO: Supabase 음원 연결 후 자동 재생
    //
    // if (audioRef.current) {
    //   audioRef.current.currentTime = 0;
    //   void audioRef.current.play();
    // }
  }, [question.id, question.type]);

  const isChoice = isChoiceQuestion(question);
  const isMultipleChoice = isChoice && question.answerType === "multiple";

  const updateScrollGuide = () => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = element;

    setCanScrollUp(scrollTop > 1);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 1);
  };

  useEffect(() => {
    if (!isChoice) {
      return;
    }

    const element = scrollRef.current;

    if (!element) {
      return;
    }

    updateScrollGuide();

    const resizeObserver = new ResizeObserver(() => {
      updateScrollGuide();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isChoice, question.id, question.options?.length]);

  if (!player) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-400">
        문제를 준비하는 중...
      </div>
    );
  }

  if (submission) {
    return (
      <WaitingView users={users} game={game} deadlineAt={player.deadlineAt} />
    );
  }

  const canSubmit = (isChoice ? selectedOptions.length > 0 : answer.length > 0) &&
    remainingSeconds !== null && remainingSeconds > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    void submitAnswer(isChoice ? selectedOptions : answer, player);
  };

  const handleChoice = (index: number) => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;
    if (isMultipleChoice) {
      setSelectedOptions((current) => current.includes(index)
        ? current.filter((value) => value !== index)
        : [...current, index]);
      return;
    }
    if (selectedOptions.includes(index)) {
      void submitAnswer([index], player);

      return;
    }

    setSelectedOptions([index]);
  };

  const handleReplaySound = () => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-[52px] py-8">
      <div className="flex shrink-0 items-start justify-between">
        <div className="flex max-w-6xl items-start gap-8">
          <span className="shrink-0 text-[20px] font-medium text-zinc-200">
            {game.currentRound + 1}.
          </span>

          <p className="text-[20px] leading-relaxed text-zinc-200">
            {question.question}
          </p>

          {question.type === "sound" && (
            <button
              type="button"
              onClick={handleReplaySound}
              className="flex items-center justify-center text-zinc-200 transition hover:text-white"
              aria-label="소리 처음부터 다시 재생"
            >
              <Volume2 size={54} strokeWidth={1.8} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-zinc-300">
          <svg
            width="24"
            height="24"
            viewBox="0 0 42 42"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="21"
              cy="21"
              r="19"
              stroke="currentColor"
              strokeWidth="4"
            />

            <path
              d="M21 11V21L27 27"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span className="text-[18px] font-medium">{remainingSeconds}</span>
        </div>
      </div>

      {question.type === "image" && (
        <div className="mt-8 min-h-[260px]">
          {/*
            TODO: Supabase 이미지 연결

            <img
              src={question.imageUrl}
              alt=""
              className="max-h-[260px] max-w-[520px] rounded-lg object-contain"
            />
          */}
        </div>
      )}

      {getVisibleHints(question.hints ?? [], remainingSeconds).map((hint, index) => (
        <p key={hint.id ?? index} className="mt-3 whitespace-pre-wrap text-zinc-400">{hint.content}</p>
      ))}

      {isChoice ? (
        <div className="relative mt-8 min-h-0 flex-1">
          {canScrollUp && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-10 items-start justify-center bg-gradient-to-b from-[#09090B] to-transparent pt-1">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 15L12 9L18 15"
                  stroke="#71717A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          <div
            ref={scrollRef}
            onScroll={updateScrollGuide}
            className="
              h-full overflow-y-auto
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            <div className="flex flex-col gap-4 py-1 pb-10">
              {question.options?.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={selectedOptions.includes(index)}
                  onClick={() => handleChoice(index)}
                  className={`
                    min-h-[60px] w-full shrink-0 px-6 py-3.5 text-left
                    rounded-lg
                    text-[16px]
                    transition
                    ${
                      selectedOptions.includes(index)
                        ? "bg-zinc-700 text-zinc-100"
                        : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                    }
                  `}
                >
                  {option}
                </button>
              ))}

              {!isMultipleChoice && selectedOptions.length > 0 && (
                <p className="text-right text-sm text-zinc-500">
                  선택한 답을 한 번 더 누르면 제출됩니다.
                </p>
              )}
            </div>
          </div>

          {canScrollDown && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-10 items-end justify-center bg-gradient-to-t from-[#09090B] to-transparent pb-1">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="#71717A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-auto pb-8 pt-8">
          <div className="relative w-full">
            <input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSubmit();
                }
              }}
              placeholder="정답을 입력하세요"
              className="
                h-[82px] w-full bg-zinc-900 px-7 pr-20
                rounded-lg
                text-[17px] text-zinc-100
                placeholder:text-zinc-500
                outline-none
              "
            />

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="
                absolute right-6 top-1/2 -translate-y-1/2
                text-zinc-500
                transition hover:text-zinc-300
                disabled:cursor-not-allowed disabled:opacity-40
              "
              aria-label="정답 제출"
            >
              <CornerDownLeft size={32} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
      {isMultipleChoice && (
        <div className="flex shrink-0 items-center justify-end gap-4 pt-4">
          <p className="text-sm text-zinc-500">정답을 모두 선택한 뒤 제출해 주세요.</p>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="rounded-lg bg-zinc-800 px-6 py-3 text-zinc-200 disabled:opacity-40"
          >
            정답 제출
          </button>
        </div>
      )}
    </div>
  );
};
