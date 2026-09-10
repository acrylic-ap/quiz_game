"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { mapTopic } from "@/lib/topics";
import { Topic } from "@/types/topic/topic";

export const useTopics = () => {
  return useQuery<Topic[]>({
    queryKey: ["topics"],

    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "topics"));

      return snapshot.docs.map((doc) => mapTopic(doc.id, doc.data()));
    },

    staleTime: Infinity,
  });
};
