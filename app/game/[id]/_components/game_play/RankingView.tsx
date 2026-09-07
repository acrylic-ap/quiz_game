"use client";

import { useMemo } from "react";

import { useGamePlayActions } from "@/hooks/queries/game/actions/useGamePlayActions";
import { Game } from "@/types/game/game";
import { getRankedEntries } from "@/utils/game";
import { PhaseCountdown, PhaseNextButton } from "./PhaseTransition";
import { GameUser } from "./types";

interface RankingViewProps {
  roomId: string;
  userId: string;
  users: GameUser[];
  game: Game;
  serverTimeOffset: number;
}

export const RankingView = ({
  roomId,
  userId,
  users,
  game,
  serverTimeOffset,
}: RankingViewProps) => {
  const { requestRankingNext } = useGamePlayActions(roomId, userId);
  const nicknameMap = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user.nickname])),
    [users],
  );
  const rows = getRankedEntries(game.ranking ?? {});
  const hasRequested = game.round?.rankingNextReady?.[userId] === true;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <PhaseCountdown
        requestedAt={game.round?.rankingNextRequestedAt}
        serverTimeOffset={serverTimeOffset}
      />
      <h2 className="text-3xl font-semibold text-zinc-100">현재 순위</h2>

      <div className="w-full max-w-2xl space-y-3">
        {rows.map((row) => (
          <div
            key={row.userId}
            className={`flex items-center rounded-lg border px-5 py-4 ${
              row.rank === 1
                ? "border-zinc-300 bg-zinc-800"
                : "border-zinc-800 bg-zinc-900"
            }`}
          >
            <span className="w-16 text-xl font-semibold text-zinc-200">
              {row.rank}위
            </span>
            <span className="flex-1 text-zinc-100">
              {nicknameMap[row.userId] ?? row.userId}
            </span>
            {row.combo > 0 && (
              <span className="mr-6 text-sm text-zinc-400">
                {row.combo} combo
              </span>
            )}
            <span className="font-semibold text-zinc-200">{row.score}</span>
          </div>
        ))}
      </div>

      <PhaseNextButton
        hasRequested={hasRequested}
        onClick={() => void requestRankingNext()}
      />
    </div>
  );
};
