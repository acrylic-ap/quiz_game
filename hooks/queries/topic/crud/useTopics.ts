"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Topic } from "@/types/topic/topic";

export const useTopics = () => {
  return useQuery<Topic[]>({
    queryKey: ["topics"],

    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "topics"));

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        topicName: doc.data().topicName ?? "",
        description: doc.data().description ?? "",
        category: doc.data().category ?? "",
      }));
    },

    staleTime: Infinity,
  });
};
