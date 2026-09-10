"use client";

import { useQuery } from "@tanstack/react-query";

import { Question } from "@/types/topic/topic";
import { loadQuestions } from "@/lib/topics";

export const useTopicQuestions = (topicId: string | undefined) => {
  return useQuery<Question[]>({
    queryKey: ["topic_questions", topicId],

    queryFn: async () => {
      if (!topicId) {
        return [];
      }

      return loadQuestions(topicId);
    },

    enabled: !!topicId,
    staleTime: Infinity,
  });
};
