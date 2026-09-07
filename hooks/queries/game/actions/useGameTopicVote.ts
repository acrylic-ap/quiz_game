"use client";

import { useMutation } from "@tanstack/react-query";
import { ref, runTransaction, serverTimestamp } from "firebase/database";

import { rtdb } from "@/lib/firebase";

export const useGameTopicVote = (
  roomId: string | undefined,
  userId: string | undefined,
) => {
  return useMutation({
    mutationFn: async (topicId: string) => {
      if (!roomId) {
        throw new Error("방 아이디가 없습니다.");
      }

      if (!userId) {
        throw new Error("사용자 정보가 없습니다.");
      }

      if (!topicId) {
        throw new Error("주제가 없습니다.");
      }

      const gameRef = ref(rtdb, `room_sessions/${roomId}/game`);

      const result = await runTransaction(gameRef, (game) => {
        if (!game || game.selectedTopicId) {
          return;
        }

        return {
          ...game,
          topicVotes: {
            ...game.topicVotes,
            [userId]: { topicId },
          },
          topicVoteStartedAt: game.topicVoteStartedAt ?? serverTimestamp(),
        };
      });

      if (!result.committed) {
        throw new Error("투표가 종료되었습니다.");
      }
    },
  });
};
