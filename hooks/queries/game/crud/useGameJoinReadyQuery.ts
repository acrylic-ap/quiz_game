"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { onValue, ref } from "firebase/database";

import { useEffect } from "react";

import { rtdb } from "@/lib/firebase";

interface JoinReadyUser {
  ready: boolean;
}

export const useGameJoinReadyQuery = (roomId: string | undefined) => {
  const queryClient = useQueryClient();

  const queryKey = ["game_join_ready", roomId];

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const joinReadyRef = ref(rtdb, `room_sessions/${roomId}/game/joinReady`);

    const unsubscribe = onValue(joinReadyRef, (snapshot) => {
      const data = snapshot.val();

      queryClient.setQueryData<Record<string, JoinReadyUser>>(
        queryKey,
        data ?? {},
      );
    });

    return unsubscribe;
  }, [roomId, queryClient]);

  return useQuery<Record<string, JoinReadyUser>>({
    queryKey,

    queryFn: () => ({}),

    enabled: !!roomId,

    staleTime: Infinity,

    gcTime: Infinity,
  });
};
