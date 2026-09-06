"use client";

import { UserRound } from "lucide-react";

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
}

export const GameTopicVotePanel = ({
  roomId,
  userId,
  users,
  topicIds,
  topicNames,
  decision,
}: GameTopicVotePanelProps) => {
  const { data: selectedTopicId } = useGameSelectedTopic(roomId);

  const { data: topicVotes = {} } = useGameTopicVotes(roomId);

  const { mutate: voteForTopic, isPending } = useGameTopicVote(roomId, userId);

  if (
    decision !== "vote" ||
    topicIds.length < 2 ||
    selectedTopicId
  ) {
    return null;
  }

  const hasVoted = !!userId && !!topicVotes[userId];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <p className="text-xl font-semibold text-zinc-100">주제를 선택하세요</p>

      <div className="flex max-w-full flex-wrap justify-center gap-4">
        {topicIds.map((topicId) => {
          const voteCount = users.filter(
            (user) => topicVotes[user.id]?.topicId === topicId,
          ).length;

          return (
            <button
              key={topicId}
              type="button"
              disabled={hasVoted || isPending}
              onClick={() => voteForTopic(topicId)}
              className="w-44 rounded-xl border border-zinc-700 bg-zinc-900 p-5 text-left transition-colors hover:border-zinc-300 disabled:cursor-default disabled:hover:border-zinc-700"
            >
              <p className="truncate text-base font-semibold text-zinc-100">
                {topicNames[topicId] ?? topicId}
              </p>

              <div className="mt-6 flex min-h-5 flex-wrap gap-1 text-zinc-200">
                {users.slice(0, 8).map((user) =>
                  topicVotes[user.id]?.topicId === topicId ? (
                    <UserRound key={user.id} size={16} fill="currentColor" />
                  ) : null,
                )}
              </div>

              <p className="mt-2 text-xs text-zinc-400">{voteCount}표</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
