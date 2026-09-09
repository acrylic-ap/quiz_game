"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Question } from "@/types/topic/topic";

export const useTopicQuestions = (topicId: string | undefined) => {
  return useQuery<Question[]>({
    queryKey: ["topic_questions", topicId],

    queryFn: async () => {
      if (!topicId) {
        return [];
      }

      const questionsSnapshot = await getDocs(
        collection(db, "topics", topicId, "questions"),
      );

      return questionsSnapshot.docs.map((questionDoc) => {
        const data = questionDoc.data();

        return {
          id: questionDoc.id,
          question: data.question ?? "",
          type: data.type ?? "",
          questionType: data.questionType,
          answerType: data.answerType,
          options: data.options ?? [],
          answer: data.answer,
          difficulty: data.difficulty,
          hints: data.hints ?? [],
        };
      });
    },

    enabled: !!topicId,
    staleTime: Infinity,
  });
};
