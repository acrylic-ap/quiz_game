"use client";

import { useMemo, useState } from "react";

import { CrownIcon } from "@/components/common/icons/CrownIcon";
import { RankingPanelToggleIcon } from "@/components/common/icons/RankingPanelToggleIcon";
import { Game } from "@/types/game/game";
import { GameUser } from "./types";

interface RankingPopupProps {
  userId: string;
  users: GameUser[];
  game: Game;
}

interface RankedUser extends GameUser {
  score: number;
  combo: number;
  rank: number;
}

export const RankingPopup = ({ userId, users, game }: RankingPopupProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const rankedUsers = useMemo<RankedUser[]>(() => {
    const ranking = game.ranking ?? {};

    const sortedUsers = users
      .map((user) => ({
        ...user,
        score: ranking[user.id]?.score ?? 0,
        combo: ranking[user.id]?.combo ?? 0,
      }))
      .sort((a, b) => b.score - a.score);

    let previousScore: number | null = null;
    let previousRank = 0;

    return sortedUsers.map((user, index) => {
      const rank = previousScore === user.score ? previousRank : index + 1;

      previousScore = user.score;
      previousRank = rank;

      return {
        ...user,
        rank,
      };
    });
  }, [game.ranking, users]);

  return (
    <div
      className={`
        absolute top-1/2 z-30
        -translate-y-1/2
        transition-all duration-300
        ${
          isOpen
            ? "right-5 translate-x-0"
            : "right-[-10px] translate-x-[calc(100%-2px)]"
        }
      `}
    >
      <div className="relative">
        <div
          className={`
            h-[300px] w-[260px]
            rounded-lg
            border border-[#3F3F46]
            bg-[#09090B]
            p-3
            ${isOpen ? "shadow-lg" : ""}
          `}
        >
          {isOpen && (
            <div
              className="
                flex h-full flex-col gap-2
                overflow-y-auto
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {rankedUsers.map((user) => {
                const isMe = user.id === userId;

                return (
                  <div
                    key={user.id}
                    className={`
                      flex min-h-[46px] shrink-0
                      items-center rounded-lg px-4
                      ${
                        user.rank === 1
                          ? "bg-[#52525B]/50"
                          : user.rank === 2
                            ? "bg-[#3F3F46]/50"
                            : "bg-[#27272A]/50"
                      }
                    `}
                  >
                    <div className="flex w-10 shrink-0 items-center justify-center">
                      {user.rank === 1 ? (
                        <CrownIcon />
                      ) : (
                        <span
                          className={
                            user.rank <= 3
                              ? "text-base font-semibold text-white"
                              : "text-sm font-medium text-zinc-300"
                          }
                        >
                          {user.rank}
                        </span>
                      )}
                    </div>

                    <div className="ml-2 min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-medium ${
                          isMe ? "text-[#EFEF6A]" : "text-zinc-200"
                        }`}
                      >
                        {user.nickname}
                      </p>
                    </div>

                    <span className="ml-3 shrink-0 text-sm font-medium text-white">
                      {user.score.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className={`
            absolute top-1/2
            flex h-12 w-8
            -translate-y-1/2
            items-center justify-center
            text-[#3F3F46]
            transition
            hover:text-zinc-500
            ${isOpen ? "left-full ml-2" : "right-full mr-2"}
          `}
          aria-label={isOpen ? "순위 닫기" : "순위 열기"}
        >
          <RankingPanelToggleIcon isOpen={isOpen} />
        </button>
      </div>
    </div>
  );
};
