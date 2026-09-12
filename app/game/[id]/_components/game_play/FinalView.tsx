"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CrownIcon } from "@/components/common/icons/CrownIcon";
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

interface RankedEntry {
  userId: string;
  score: number;
  rank: number;
}

interface TopRankGroup {
  rank: 1 | 2 | 3;
  entries: RankedEntry[];
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

  const [entered, setEntered] = useState(false);

  const nicknameMap = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user.nickname])),
    [users],
  );

  const rows = getRankedEntries(game.ranking ?? {});

  const firstPlace = rows.filter((row) => row.rank === 1);
  const secondPlace = rows.filter((row) => row.rank === 2);
  const thirdPlace = rows.filter((row) => row.rank === 3);

  const lowerRanks = rows.filter((row) => row.rank > 3);

  const topRankGroups = useMemo<TopRankGroup[]>(
    () =>
      [
        {
          rank: 2 as const,
          entries: secondPlace,
        },
        {
          rank: 1 as const,
          entries: firstPlace,
        },
        {
          rank: 3 as const,
          entries: thirdPlace,
        },
      ].filter((group) => group.entries.length > 0),
    [firstPlace, secondPlace, thirdPlace],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setEntered(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const renderTopRanking = () => {
    return (
      <div
        className={`
          transition-all duration-500 ease-out
          ${
            entered
              ? "translate-y-0 opacity-100"
              : "translate-y-[14px] opacity-0"
          }
        `}
      >
        <div
          className={`
            mx-auto flex w-full max-w-[820px]
            items-end justify-center
            ${
              topRankGroups.length === 1
                ? ""
                : topRankGroups.length === 2
                  ? "gap-[18px]"
                  : "gap-[14px]"
            }
          `}
        >
          {topRankGroups.map((group) => {
            const isFirst = group.rank === 1;

            return (
              <div
                key={group.rank}
                className={isFirst ? "w-[280px]" : "w-[240px]"}
              >
                <TopRankCard
                  rank={group.rank}
                  entries={group.entries}
                  nicknameMap={nicknameMap}
                  userId={userId}
                  primary={isFirst}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-[52px] py-[34px]">
      {/* 제목 */}
      <div
        className={`
          shrink-0 text-center
          transition-all duration-500 ease-out
          ${
            entered
              ? "translate-y-0 opacity-100"
              : "translate-y-[8px] opacity-0"
          }
        `}
      >
        <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-zinc-100">
          최종 결과
        </h2>

        <p className="mt-[6px] text-[14px] text-zinc-500">
          게임이 종료되었습니다.
        </p>
      </div>

      {lowerRanks.length === 0 ? (
        /* 상위 랭킹만 있으면 중앙 */
        <div className="flex min-h-0 flex-1 items-center justify-center">
          {renderTopRanking()}
        </div>
      ) : (
        <>
          {/* 상위 랭킹 */}
          <div className="mt-[30px] shrink-0">{renderTopRanking()}</div>

          {/* 구분선 */}
          <div
            className={`
              mx-auto mt-[26px] h-px w-full max-w-[820px]
              shrink-0 bg-zinc-800
              transition-opacity delay-100 duration-500
              ${entered ? "opacity-100" : "opacity-0"}
            `}
          />

          {/* 4위 이하 */}
          <div
            className={`
              mx-auto mt-[18px] flex min-h-0 w-full max-w-[820px]
              flex-1 flex-col
              transition-all delay-150 duration-500 ease-out
              ${
                entered
                  ? "translate-y-0 opacity-100"
                  : "translate-y-[10px] opacity-0"
              }
            `}
          >
            {/* 헤더 */}
            <div className="mb-[8px] flex shrink-0 items-center px-[18px]">
              <span className="w-[72px] text-[12px] text-zinc-600">순위</span>

              <span className="flex-1 text-[12px] text-zinc-600">플레이어</span>

              <span className="w-[100px] text-right text-[12px] text-zinc-600">
                점수
              </span>
            </div>

            {/* 랭킹 목록 */}
            <div className="no-scrollbar min-h-0 flex-1 space-y-[7px] overflow-y-auto pr-[2px]">
              {lowerRanks.map((row) => {
                const isMe = row.userId === userId;

                return (
                  <div
                    key={row.userId}
                    className={`
                      flex min-h-[52px] items-center
                      rounded-[9px] border px-[18px]
                      ${
                        isMe
                          ? "border-zinc-600 bg-zinc-800/60"
                          : "border-zinc-800 bg-[#111113]"
                      }
                    `}
                  >
                    <span className="w-[72px] text-[15px] font-semibold text-zinc-500">
                      {row.rank}
                    </span>

                    <div className="flex min-w-0 flex-1 items-center gap-[8px]">
                      <span
                        className={`
                          truncate text-[15px]
                          ${
                            isMe ? "font-medium text-zinc-100" : "text-zinc-300"
                          }
                        `}
                      >
                        {nicknameMap[row.userId] ?? row.userId}
                      </span>

                      {isMe && (
                        <span className="shrink-0 rounded-[4px] bg-zinc-700 px-[6px] py-[2px] text-[10px] text-zinc-300">
                          나
                        </span>
                      )}
                    </div>

                    <span className="w-[100px] text-right text-[15px] font-medium text-zinc-300">
                      {row.score.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 하단 버튼 */}
      <div
        className={`
          mt-[24px] flex shrink-0 justify-center gap-[10px]
          transition-all delay-300 duration-500 ease-out
          ${
            entered
              ? "translate-y-0 opacity-100"
              : "translate-y-[8px] opacity-0"
          }
        `}
      >
        <button
          type="button"
          onClick={async () => {
            await exitRoom(isOwner);
            router.replace("/");
          }}
          className="
            h-[44px] min-w-[150px]
            rounded-[8px]
            border border-zinc-700
            px-[20px]
            text-[14px] font-medium text-zinc-400
            transition-colors
            hover:border-zinc-600
            hover:bg-zinc-900
            hover:text-zinc-200
          "
        >
          로비로 돌아가기
        </button>

        <button
          type="button"
          onClick={async () => {
            await returnToRoom();
            router.replace(`/room/${roomId}`);
          }}
          className="
            h-[44px] min-w-[150px]
            rounded-[8px]
            bg-zinc-100
            px-[20px]
            text-[14px] font-semibold text-zinc-950
            transition-colors
            hover:bg-white
          "
        >
          방으로 돌아가기
        </button>
      </div>
    </div>
  );
};

interface TopRankCardProps {
  rank: 1 | 2 | 3;
  entries: RankedEntry[];
  nicknameMap: Record<string, string>;
  userId: string;
  primary?: boolean;
}

const TopRankCard = ({
  rank,
  entries,
  nicknameMap,
  userId,
  primary = false,
}: TopRankCardProps) => {
  const score = entries[0]?.score;

  return (
    <div
      className={`
        flex w-full min-w-0 flex-col items-center
        rounded-[12px] border
        ${
          primary
            ? `
              min-h-[176px]
              border-zinc-600
              bg-[#18181B]
              px-[22px] py-[24px]
            `
            : `
              min-h-[150px]
              border-zinc-800
              bg-[#111113]
              px-[20px] py-[20px]
            `
        }
      `}
    >
      {/* 순위 */}
      {rank === 1 ? (
        <div className="flex h-[48px] items-center justify-center">
          <CrownIcon className="h-[36px] w-[42px]" />
        </div>
      ) : (
        <div
          className="
            flex h-[38px] w-[38px]
            items-center justify-center
            rounded-full bg-zinc-800
            text-[15px] font-bold text-zinc-300
          "
        >
          {rank}
        </div>
      )}

      {/* 플레이어 */}
      <div
        className={`
          flex w-full min-w-0 flex-col items-center gap-[5px]
          ${rank === 1 ? "mt-[12px]" : "mt-[16px]"}
        `}
      >
        {entries.map((entry) => {
          const isMe = entry.userId === userId;

          return (
            <div
              key={entry.userId}
              className="flex max-w-full items-center justify-center gap-[6px]"
            >
              <span
                className={`
                  truncate text-center
                  ${
                    primary
                      ? "text-[17px] font-semibold text-zinc-100"
                      : "text-[15px] font-medium text-zinc-300"
                  }
                `}
              >
                {nicknameMap[entry.userId] ?? entry.userId}
              </span>

              {isMe && (
                <span className="shrink-0 rounded-[4px] bg-zinc-700 px-[5px] py-[1px] text-[9px] font-medium text-zinc-300">
                  나
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 점수 */}
      {typeof score === "number" && (
        <span
          className={`
            mt-auto pt-[14px] font-medium
            ${
              primary
                ? "text-[16px] text-zinc-300"
                : "text-[14px] text-zinc-500"
            }
          `}
        >
          {score.toLocaleString()}점
        </span>
      )}
    </div>
  );
};
