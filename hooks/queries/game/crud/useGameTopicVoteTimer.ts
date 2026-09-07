"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";

import { rtdb } from "@/lib/firebase";

export const useGameTopicVoteTimer = (roomId: string | undefined) => {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const startedAtRef = ref(
      rtdb,
      `room_sessions/${roomId}/game/topicVoteStartedAt`,
    );

    const serverTimeOffsetRef = ref(rtdb, ".info/serverTimeOffset");

    const unsubscribeStartedAt = onValue(startedAtRef, (snapshot) => {
      setStartedAt(snapshot.val() ?? null);
    });

    const unsubscribeServerTimeOffset = onValue(
      serverTimeOffsetRef,
      (snapshot) => {
        setServerTimeOffset(snapshot.val() ?? 0);
      },
    );

    return () => {
      unsubscribeStartedAt();
      unsubscribeServerTimeOffset();
    };
  }, [roomId]);

  return { startedAt, serverTimeOffset };
};
