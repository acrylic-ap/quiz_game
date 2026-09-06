"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { onValue, ref } from "firebase/database";

import { useEffect } from "react";

import { rtdb } from "@/lib/firebase";

export const useGameSelectedTopic = (roomId: string | undefined) => {
  const queryClient = useQueryClient();

  const queryKey = ["game_selected_topic", roomId];

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const selectedTopicRef = ref(
      rtdb,
      `room_sessions/${roomId}/game/selectedTopicId`,
    );

    const unsubscribe = onValue(selectedTopicRef, (snapshot) => {
      queryClient.setQueryData<string | null>(queryKey, snapshot.val() ?? null);
    });

    return unsubscribe;
  }, [roomId, queryClient]);

  return useQuery<string | null>({
    queryKey,

    queryFn: () => null,

    enabled: !!roomId,

    staleTime: Infinity,

    gcTime: Infinity,
  });
};
