"use client";

import { useMemo, useState } from "react";

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
                        <svg
                          width="26"
                          height="20"
                          viewBox="0 0 74 54"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M63.216 54H11.156C9.296 54 7.809 52.876 7.437 51.004L0 13.548C0 12.05 0.372 10.551 1.859 9.428C3.347 8.678 4.834 8.678 5.95 9.428L21.196 21.788L33.839 2.686C35.327 0.438 38.673 0.438 40.161 2.686L52.804 21.788L68.05 9.428C69.166 8.304 71.025 8.304 72.141 9.428C73.628 10.177 74 11.675 74 13.548L66.563 51.004C66.563 52.876 64.704 54 62.844 54H63.216Z"
                            fill="#EFEF6A"
                          />
                        </svg>
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
          <svg
            width="14"
            height="24"
            viewBox="0 0 22 39"
            fill="none"
            aria-hidden="true"
          >
            <path
              d={isOpen ? "M1 1L20 19.5L1 38" : "M21 1L2 19.5L21 38"}
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
