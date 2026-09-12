"use client";

import { Game } from "@/types/game/game";
import { isSubmissionComplete } from "@/utils/game";
import { ClockIcon } from "@/components/common/icons/ClockIcon";
import { VoterIcon } from "@/components/common/icons/VoterIcon";

import { GameUser } from "./types";
import { useRemainingSeconds } from "./useRemainingSeconds";

interface WaitingViewProps {
  users: GameUser[];
  game: Game;
  deadlineAt: number;
}

export const WaitingView = ({ users, game, deadlineAt }: WaitingViewProps) => {
  const remainingSeconds = useRemainingSeconds(deadlineAt);

  const submissions = game.round?.submissions ?? {};

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center">
        <p className="text-2xl font-medium text-zinc-200">
          다른 플레이어를 기다리고 있습니다...
        </p>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex min-h-16 min-w-72 items-center justify-center bg-zinc-900 px-6 rounded-lg">
            <div className="flex items-center gap-3">
              {users.map((user) => {
                const complete = isSubmissionComplete(submissions[user.id]);

                return (
                  <VoterIcon
                    key={user.id}
                    width="26"
                    height="30"
                    fill={complete ? "#D4D4D8" : "#52525B"}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex min-h-16 min-w-24 items-center justify-center gap-2 bg-zinc-900 px-4 rounded-lg">
            <ClockIcon size={20} className="text-zinc-300" />

            <span className="text-base font-medium text-zinc-300">
              {remainingSeconds}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
