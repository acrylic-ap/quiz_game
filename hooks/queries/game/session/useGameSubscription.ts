"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { onValue, ref } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { Game } from "@/types/game/game";

export const useGameSubscription = (roomId: string | undefined) => {
  const queryClient = useQueryClient();

  const queryKey = ["game", roomId];

  useEffect(() => {
    if (!roomId) return;

    const gameRef = ref(rtdb, `room_sessions/${roomId}/game`);

    return onValue(gameRef, (snapshot) => {
      if (!snapshot.exists()) {
        queryClient.setQueryData<Game | null>(queryKey, null);
        return;
      }

      const data = snapshot.val();

      queryClient.setQueryData<Game>(queryKey, {
        currentRound: data.currentRound ?? 0,
        questionList: data.questionList ?? [],
      });
    });
  }, [roomId, queryClient]);

  return useQuery<Game | null>({
    queryKey,
    queryFn: () => queryClient.getQueryData<Game>(queryKey) ?? null,
    enabled: !!roomId,
    staleTime: Infinity,
  });
};
