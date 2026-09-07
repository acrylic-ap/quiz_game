"use client";

import { useEffect, useState } from "react";

export const useRemainingSeconds = (
  deadlineAt: number | undefined,
  serverTimeOffset = 0,
) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadlineAt) {
      return;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 200);

    return () => window.clearInterval(interval);
  }, [deadlineAt]);

  if (!deadlineAt) {
    return null;
  }

  return Math.max(
    0,
    Math.ceil((deadlineAt - (now + serverTimeOffset)) / 1_000),
  );
};
