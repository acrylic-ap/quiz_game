"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useRoomExit } from "@/hooks/queries/room/session/useRoomExit";
import { Game } from "@/types/game/game";
import { getRankedEntries } from "@/utils/game";
import { GameUser } from "./types";

interface FinalViewProps {
  roomId: string;
  userId: string;
  isOwner: boolean;
  users: GameUser[];
  game: Game;
  returnToRoom: () => Promise<void>;
}

export const FinalView = ({
  roomId,
  userId,
  isOwner,
  users,
  game,
  returnToRoom,
}: FinalViewProps) => {
  const router = useRouter();
  const { exitRoom } = useRoomExit(roomId, userId);
  const [revealStage, setRevealStage] = useState(0);
  const nicknameMap = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user.nickname])),
    [users],
  );
  const rows = getRankedEntries(game.ranking ?? {});

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setRevealStage(1), 400),
      window.setTimeout(() => setRevealStage(2), 1_300),
      window.setTimeout(() => setRevealStage(3), 2_200),
      window.setTimeout(() => setRevealStage(4), 3_100),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const revealedRanks = [3, 2, 1].slice(0, revealStage);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <h2 className="text-3xl font-semibold text-zinc-100">최종 결과</h2>

      {revealStage < 4 ? (
        <div className="min-h-52 w-full max-w-xl space-y-4">
          {revealedRanks.map((rank) => {
            const winners = rows.filter((row) => row.rank === rank);

            return winners.map((row) => (
              <div
                key={row.userId}
                className="flex items-center rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-5 transition"
              >
                <span className="w-20 text-2xl font-bold text-zinc-200">
                  {rank}위
                </span>
                <span className="flex-1 text-xl text-zinc-100">
                  {nicknameMap[row.userId] ?? row.userId}
                </span>
                <span className="text-zinc-300">{row.score}</span>
              </div>
            ));
          })}
        </div>
      ) : (
        <div className="w-full max-w-xl space-y-3">
          {rows.map((row) => (
            <div
              key={row.userId}
              className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4"
            >
              <span className="w-16 font-semibold text-zinc-200">
                {row.rank}위
              </span>
              <span className="flex-1 text-zinc-100">
                {nicknameMap[row.userId] ?? row.userId}
              </span>
              <span className="text-zinc-300">{row.score}</span>
            </div>
          ))}
        </div>
      )}

      {revealStage >= 4 && (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={async () => {
              await exitRoom(isOwner);
              router.replace("/");
            }}
            className="rounded-lg border border-zinc-700 px-7 py-3 text-zinc-200"
          >
            로비로 돌아가기
          </button>
          <button
            type="button"
            onClick={async () => {
              await returnToRoom();
              router.replace(`/room/${roomId}`);
            }}
            className="rounded-lg bg-zinc-200 px-7 py-3 font-semibold text-zinc-950"
          >
            방으로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
};
