"use client";

import { collection, getDocs } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";

import { db } from "@/lib/firebase";
import { Question } from "@/types/topic/topic";

export const useQuizQuestions = (
  topicId: string | undefined,
  quizId: string | undefined,
) => {
  return useQuery({
    queryKey: ["quizQuestions", topicId, quizId],

    queryFn: async (): Promise<Question[]> => {
      if (!topicId || !quizId) {
        throw new Error("Topic 또는 Quiz ID가 없습니다.");
      }

      const questionsSnapshot = await getDocs(
        collection(db, "topics", topicId, "quizzes", quizId, "questions"),
      );

      return questionsSnapshot.docs.map((questionDoc) => ({
        id: questionDoc.id,
        question: questionDoc.data().question ?? "",
        type: questionDoc.data().type ?? "",
        questionType: questionDoc.data().questionType,
        answerType: questionDoc.data().answerType,
        options: questionDoc.data().options ?? [],
        answer: questionDoc.data().answer,
        difficulty: questionDoc.data().difficulty,
        hints: questionDoc.data().hints ?? [],
      }));
    },

    enabled: !!topicId && !!quizId,

    staleTime: Infinity,
  });
};
