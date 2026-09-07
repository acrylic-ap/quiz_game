"use client";

import { useEffect, useMemo, useState } from "react";

import { useGameTopicVote } from "@/hooks/queries/game/actions/useGameTopicVote";
import { useGameSelectedTopic } from "@/hooks/queries/game/crud/useGameSelectedTopic";
import { useGameTopicVotes } from "@/hooks/queries/game/crud/useGameTopicVotes";
import { countTopicVotes, getWinningTopicIds } from "@/utils/topic";

interface GameUser {
  id: string;
}

interface GameTopicVotePanelProps {
  roomId: string;
  userId: string | undefined;
  users: GameUser[];
  topicIds: string[];
  topicNames: Record<string, string>;
  topicDescriptions: Record<string, string>;
  topicCategories: Record<string, string>;
  decision: "random" | "vote" | "always_random";
  topicVoteStartedAt: number | null;
  serverTimeOffset: number;
}

export const GameTopicVotePanel = ({
  roomId,
  userId,
  users,
  topicIds,
  topicNames,
  topicDescriptions,
  topicCategories,
  decision,
  topicVoteStartedAt,
  serverTimeOffset,
}: GameTopicVotePanelProps) => {
  const { data: selectedTopicId } = useGameSelectedTopic(roomId);

  const { data: topicVotes = {} } = useGameTopicVotes(roomId);

  const { mutate: voteForTopic, isPending } = useGameTopicVote(roomId, userId);

  const [now, setNow] = useState(() => Date.now());
  const [tieActiveIndex, setTieActiveIndex] = useState(0);

  const winningTopicIds = useMemo(() => {
    const validVotes = Object.fromEntries(
      Object.entries(topicVotes).filter(([, vote]) =>
        topicIds.includes(vote.topicId),
      ),
    );
    const voteCount = countTopicVotes(validVotes);

    topicIds.forEach((topicId) => {
      voteCount[topicId] ??= 0;
    });

    return getWinningTopicIds(voteCount);
  }, [topicIds, topicVotes]);

  const allUsersVoted =
    users.length > 0 &&
    users.every((user) => topicVotes[user.id]?.topicId !== undefined);

  const remainingSeconds = topicVoteStartedAt
    ? Math.min(
        10,
        Math.max(
          0,
          Math.ceil(
            (topicVoteStartedAt + 10_000 - (now + serverTimeOffset)) / 1_000,
          ),
        ),
      )
    : null;

  const votingEnded =
    !!topicVoteStartedAt && (allUsersVoted || remainingSeconds === 0);
  const isTieBreakAnimating =
    votingEnded && winningTopicIds.length > 1 && !selectedTopicId;

  useEffect(() => {
    if (!topicVoteStartedAt || selectedTopicId) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 200);

    return () => {
      window.clearInterval(interval);
    };
  }, [selectedTopicId, topicVoteStartedAt]);

  useEffect(() => {
    if (!isTieBreakAnimating) {
      return;
    }

    const interval = window.setInterval(() => {
      setTieActiveIndex(
        (currentIndex) => (currentIndex + 1) % winningTopicIds.length,
      );
    }, 160);

    return () => {
      window.clearInterval(interval);
    };
  }, [isTieBreakAnimating, winningTopicIds.length]);

  if (decision !== "vote" || topicIds.length < 2) {
    return null;
  }

  const selectedVoteTopicId = userId ? topicVotes[userId]?.topicId : undefined;
  const animatedTopicId = isTieBreakAnimating
    ? winningTopicIds[tieActiveIndex % winningTopicIds.length]
    : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center">
      <div className="flex w-full flex-col items-start ml-10">
        <div className="flex items-center gap-4 ml-3">
          <p className="text-[24px] font-semibold text-zinc-100">
            {selectedTopicId
              ? "선택된 주제"
              : isTieBreakAnimating
                ? "동률 주제를 랜덤으로 고르는 중..."
                : votingEnded
                  ? "선택된 주제를 확인하는 중..."
                  : "주제를 선택하세요"}
          </p>

          {!votingEnded && !selectedTopicId && (
            <span
              className="
            bg-zinc-900 px-3 py-1
            rounded-md
            text-sm text-zinc-400
          "
            >
              {remainingSeconds === null
                ? "투표 대기 중"
                : `${remainingSeconds}초`}
            </span>
          )}
        </div>

        <div className="mt-12 w-full overflow-x-auto">
          <div className="flex w-max gap-[36px] pb-2">
            {topicIds.map((topicId) => {
              const voters = users.filter(
                (user) => topicVotes[user.id]?.topicId === topicId,
              );

              const isSelected = selectedVoteTopicId === topicId;
              const isActive = selectedTopicId
                ? selectedTopicId === topicId
                : isTieBreakAnimating
                  ? animatedTopicId === topicId
                  : isSelected;

              return (
                <button
                  key={topicId}
                  type="button"
                  disabled={
                    isPending || isSelected || votingEnded || !!selectedTopicId
                  }
                  onClick={() => voteForTopic(topicId)}
                  className={`
                group relative flex h-[240px] w-[232px] shrink-0 flex-col overflow-hidden bg-zinc-950 text-left
                rounded-[7px] border-2
                transition
                ${
                  isActive
                    ? "border-zinc-400"
                    : "border-zinc-700 hover:border-zinc-500"
                }
                disabled:cursor-default
              `}
                >
                  {/* 이미지 영역 - 추후 Supabase 이미지 연결 */}
                  <div className="absolute inset-0 bg-zinc-950" />

                  {/* 이미지가 들어왔을 때 사용할 어두운 오버레이 */}
                  <div className="absolute inset-0 bg-black/40" />

                  <div className="relative z-10 flex h-full flex-col p-[13px]">
                    <div className="flex items-start">
                      <div
                        className="
                      flex h-8 min-w-[63px] items-center justify-center bg-[#1E1E1E] px-3
                      rounded-lg border border-zinc-700
                      text-sm font-medium text-zinc-200
                    "
                      >
                        {topicCategories[topicId] ?? ""}
                      </div>
                    </div>

                    <div className="mt-8 ml-3">
                      <p className="line-clamp-2 text-xl font-semibold leading-snug text-zinc-50">
                        {topicNames[topicId] ?? topicId}
                      </p>

                      <p className="mt-2 text-sm text-zinc-300">
                        {topicDescriptions[topicId] ?? ""}
                      </p>
                    </div>

                    <div className="mt-auto px-1">
                      <div className="flex min-h-[28px] items-end gap-[10px]">
                        {voters.slice(0, 8).map((user) => (
                          <svg
                            key={user.id}
                            width="18"
                            height="22"
                            viewBox="0 0 18 22"
                            fill="none"
                            aria-hidden="true"
                          >
                            <circle cx="9" cy="5.5" r="5.5" fill="#D4D4D8" />

                            <path
                              d="M0 21.0287C0 7.31719 18 8.07896 18 21.0287L0 21.0287Z"
                              fill="#D4D4D8"
                            />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
