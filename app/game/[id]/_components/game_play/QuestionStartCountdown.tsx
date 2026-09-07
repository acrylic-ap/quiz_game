"use client";

import { ReactNode, useEffect, useState } from "react";

interface QuestionStartCountdownProps {
  currentRound: number;
  children: ReactNode;
}

export const QuestionStartCountdown = ({
  currentRound,
  children,
}: QuestionStartCountdownProps) => {
  const [remainingSeconds, setRemainingSeconds] = useState(3);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const secondTimer = window.setTimeout(() => setRemainingSeconds(2), 1_000);
    const firstTimer = window.setTimeout(() => setRemainingSeconds(1), 2_000);
    const completeTimer = window.setTimeout(() => setIsComplete(true), 3_000);

    return () => {
      window.clearTimeout(secondTimer);
      window.clearTimeout(firstTimer);
      window.clearTimeout(completeTimer);
    };
  }, [currentRound]);

  if (isComplete) {
    return children;
  }

  return (
    <div className="flex flex-1 items-center justify-center text-6xl font-semibold text-zinc-100">
      {remainingSeconds}
    </div>
  );
};
