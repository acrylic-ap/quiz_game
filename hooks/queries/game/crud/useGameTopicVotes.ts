"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { onValue, ref } from "firebase/database";

import { useEffect } from "react";

import { rtdb } from "@/lib/firebase";

export interface TopicVote {
  topicId: string;
}

export const useGameTopicVotes = (roomId: string | undefined) => {
  const queryClient = useQueryClient();

  const queryKey = ["game_topic_votes", roomId];

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const votesRef = ref(rtdb, `room_sessions/${roomId}/game/topicVotes`);

    const unsubscribe = onValue(votesRef, (snapshot) => {
      const data = snapshot.val();

      queryClient.setQueryData<Record<string, TopicVote>>(queryKey, data ?? {});
    });

    return unsubscribe;
  }, [roomId, queryClient]);

  return useQuery<Record<string, TopicVote>>({
    queryKey,

    queryFn: () => ({}),

    enabled: !!roomId,

    staleTime: Infinity,

    gcTime: Infinity,
  });
};
