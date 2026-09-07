"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { onValue, ref } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { Game } from "@/types/game/game";

export const useGameSubscription = (roomId: string | undefined) => {
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ["game", roomId], [roomId]);

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
        status: data.status ?? "waiting",
        phase: data.phase,
        currentRound: data.currentRound ?? 0,
        selectedTopicId: data.selectedTopicId,
        questionList: data.questionList ?? [],
        topicVotes: data.topicVotes ?? {},
        topicVoteStartedAt: data.topicVoteStartedAt,
        joinReady: data.joinReady ?? {},
        round: data.round,
        ranking: data.ranking ?? {},
        finalReturnReady: data.finalReturnReady ?? {},
      });
    });
  }, [roomId, queryClient, queryKey]);

  return useQuery<Game | null>({
    queryKey,
    queryFn: () => queryClient.getQueryData<Game>(queryKey) ?? null,
    enabled: !!roomId,
    staleTime: Infinity,
  });
};
