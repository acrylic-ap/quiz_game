"use client";

import { useEffect, useRef, useState } from "react";

import { useGamePlayActions } from "@/hooks/queries/game/actions/useGamePlayActions";
import { Game } from "@/types/game/game";
import { Question } from "@/types/topic/topic";
import { getCorrectOptionIndices, isChoiceQuestion } from "@/utils/answer";
import { PhaseCountdown, PhaseNextButton } from "./PhaseTransition";

interface ResultViewProps {
  roomId: string;
  userId: string;
  game: Game;
  question: Question;
  serverTimeOffset: number;
}

export const ResultView = ({
  roomId,
  userId,
  game,
  question,
  serverTimeOffset,
}: ResultViewProps) => {
  const { requestResultNext } = useGamePlayActions(roomId, userId);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const submission = game.round?.submissions?.[userId];

  const correctCount = Object.values(game.round?.submissions ?? {}).filter(
    (item) => item.isCorrect,
  ).length;

  const combo = submission?.combo ?? 0;

  const hasRequested = game.round?.resultNextReady?.[userId] === true;

  const isChoice = isChoiceQuestion(question);

  const isTimeout = submission?.status === "timeout";
  const isCorrect = submission?.isCorrect === true;

  const getChoiceStyle = (index: number) => {
    const isCorrectAnswer = getCorrectOptionIndices(question).includes(index);
    const isMyAnswer = Array.isArray(submission?.answer)
      ? submission.answer.includes(index)
      : question.options?.[index] === submission?.answer;

    // 정답 선지
    if (isCorrectAnswer) {
      return "bg-[#14263A] text-zinc-100";
    }

    // 내가 선택한 오답
    if (isMyAnswer && !isCorrect) {
      return "bg-[#3A1417] text-zinc-100";
    }

    // 나머지 선지
    return "bg-[#18181B] text-zinc-300";
  };

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

  return (
    <div className="relative flex min-h-0 flex-1 flex-col px-[52px] py-10">
      {/* 상단 결과 */}
      <div className="flex shrink-0 items-center justify-between">
        <PhaseCountdown
          requestedAt={game.round?.resultNextRequestedAt}
          serverTimeOffset={serverTimeOffset}
        />
      </div>

      {/* 문제 + 결과 정보 */}
      <div className="mt-12 flex shrink-0 items-start justify-between gap-10">
        <div className="flex min-w-0 flex-1 items-start gap-5">
          <span className="shrink-0 text-lg font-medium text-zinc-200">
            {game.currentRound + 1}.
          </span>

          <p className="min-w-0 text-lg leading-relaxed text-zinc-200">
            {question.question}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="flex min-w-[82px] flex-col items-center justify-center rounded-lg bg-[#18181B] px-4 py-2 text-center">
            <span className="text-xs text-zinc-500">정답자</span>

            <p className="mt-0.5 text-sm font-medium text-zinc-200">
              {correctCount}명
            </p>
          </div>

          <div className="flex min-w-[82px] flex-col items-center justify-center rounded-lg bg-[#18181B] px-4 py-2 text-center">
            <span className="text-xs text-zinc-500">콤보</span>

            <p className="mt-0.5 text-sm font-medium text-zinc-200">{combo}</p>
          </div>
        </div>
      </div>

      {/* 답안 영역 */}
      {isChoice ? (
        <div className="relative mt-10 min-h-0 flex-1">
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
            <div className="flex flex-col gap-4 py-1">
              {question.options?.map((option, index) => (
                <div
                  key={index}
                  className={`
                    flex min-h-[60px] w-full shrink-0 items-center
                    rounded-lg px-6 py-3.5 text-[16px]
                    ${getChoiceStyle(index)}
                  `}
                >
                  {option}
                </div>
              ))}
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
        <div className="mt-10 flex flex-1 flex-col gap-4">
          {/* 내 답 */}
          <div>
            <p className="mb-2 text-sm text-zinc-500">내 답</p>

            <div
              className={`flex min-h-[60px] items-center rounded-lg px-6 py-3.5 text-[16px] text-zinc-100 ${
                isTimeout
                  ? "bg-[#18181B]"
                  : isCorrect
                    ? "bg-[#143A25]"
                    : "bg-[#3A1417]"
              }`}
            >
              {isTimeout ? "시간 초과" : typeof submission?.answer === "string" ? submission.answer : ""}
            </div>
          </div>

          {/* 정답 */}
          {!isCorrect && (
            <div>
              <p className="mb-2 text-sm text-zinc-500">정답</p>

              <div className="flex min-h-[60px] items-center rounded-lg bg-[#143A25] px-6 py-3.5 text-[16px] text-zinc-100">
                {question.answer ?? ""}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 하단 */}
      <div className="flex shrink-0 justify-end pt-6">
        <PhaseNextButton
          hasRequested={hasRequested}
          onClick={() => void requestResultNext()}
        />
      </div>
    </div>
  );
};
