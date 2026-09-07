"use client";

import { PHASE_TRANSITION_MS } from "@/utils/game";
import { useRemainingSeconds } from "./useRemainingSeconds";

export const PhaseCountdown = ({
  requestedAt,
  serverTimeOffset,
}: {
  requestedAt: number | undefined;
  serverTimeOffset: number;
}) => {
  const remainingSeconds = useRemainingSeconds(
    requestedAt ? requestedAt + PHASE_TRANSITION_MS : undefined,
    serverTimeOffset,
  );

  if (remainingSeconds === null) {
    return null;
  }

  return (
    <div className="absolute right-6 top-6 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300">
      {remainingSeconds}초 후 다음으로 넘어갑니다
    </div>
  );
};

export const PhaseNextButton = ({
  hasRequested,
  onClick,
}: {
  hasRequested: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      disabled={hasRequested}
      onClick={onClick}
      className="rounded-lg bg-zinc-200 px-10 py-3 font-semibold text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-300"
    >
      다음
    </button>
  );
};
