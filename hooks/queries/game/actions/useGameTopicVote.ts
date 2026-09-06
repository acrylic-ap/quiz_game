"use client";

import { useMutation } from "@tanstack/react-query";
import { get, ref, update } from "firebase/database";

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

      const voteRef = ref(
        rtdb,
        `room_sessions/${roomId}/game/topicVotes/${userId}`,
      );

      const existingVote = await get(voteRef);

      if (existingVote.exists()) {
        throw new Error("이미 투표했습니다.");
      }

      await update(voteRef, {
        topicId,
      });
    },
  });
};
