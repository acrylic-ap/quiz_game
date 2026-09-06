"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { onValue, ref } from "firebase/database";

import { useEffect } from "react";

import { rtdb } from "@/lib/firebase";
import { Question } from "@/types/topic/topic";

export const useGameQuestionListQuery = (roomId: string | undefined) => {
  const queryClient = useQueryClient();

  const queryKey = ["game_question_list", roomId];

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const questionListRef = ref(
      rtdb,
      `room_sessions/${roomId}/game/questionList`,
    );

    const unsubscribe = onValue(questionListRef, (snapshot) => {
      const data = snapshot.val();

      queryClient.setQueryData<Question[]>(queryKey, data ?? []);
    });

    return unsubscribe;
  }, [roomId, queryClient]);

  return useQuery<Question[]>({
    queryKey,

    queryFn: () => [],

    enabled: !!roomId,

    staleTime: Infinity,

    gcTime: Infinity,
  });
};
