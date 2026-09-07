"use client";

import { useEffect, useState } from "react";

import { useGameTopicVote } from "@/hooks/queries/game/actions/useGameTopicVote";
import { useGameSelectedTopic } from "@/hooks/queries/game/crud/useGameSelectedTopic";
import { useGameTopicVotes } from "@/hooks/queries/game/crud/useGameTopicVotes";

interface GameUser {
  id: string;
}

interface GameTopicVotePanelProps {
  roomId: string;
  userId: string | undefined;
  users: GameUser[];
  topicIds: string[];
  topicNames: Record<string, string>;
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
  decision,
  topicVoteStartedAt,
  serverTimeOffset,
}: GameTopicVotePanelProps) => {
  const { data: selectedTopicId } = useGameSelectedTopic(roomId);

  const { data: topicVotes = {} } = useGameTopicVotes(roomId);

  const { mutate: voteForTopic, isPending } = useGameTopicVote(roomId, userId);

  const [now, setNow] = useState(() => Date.now());

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

  if (decision !== "vote" || topicIds.length < 2 || selectedTopicId) {
    return null;
  }

  const selectedVoteTopicId = userId ? topicVotes[userId]?.topicId : undefined;

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

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center">
      <div className="flex w-full flex-col items-start ml-10">
        <div className="flex items-center gap-4 ml-3">
          <p className="text-[24px] font-semibold text-zinc-100">
            주제를 선택하세요
          </p>

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
        </div>

        <div className="mt-12 w-full overflow-x-auto">
          <div className="flex w-max gap-[36px] pb-2">
            {topicIds.map((topicId) => {
              const voters = users.filter(
                (user) => topicVotes[user.id]?.topicId === topicId,
              );

              const isSelected = selectedVoteTopicId === topicId;

              return (
                <button
                  key={topicId}
                  type="button"
                  disabled={isPending || isSelected}
                  onClick={() => voteForTopic(topicId)}
                  className={`
                group relative flex h-[240px] w-[232px] shrink-0 flex-col overflow-hidden bg-zinc-950 text-left
                rounded-[7px] border-2
                transition
                ${
                  isSelected
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
                        주제
                      </div>
                    </div>

                    <div className="mt-8 ml-3">
                      <p className="line-clamp-2 text-xl font-semibold leading-snug text-zinc-50">
                        {topicNames[topicId] ?? topicId}
                      </p>

                      <p className="mt-2 text-sm text-zinc-300">
                        주제를 선택해 주세요
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
