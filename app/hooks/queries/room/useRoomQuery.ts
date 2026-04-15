import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { doc, onSnapshot, getDocs, collection } from "firebase/firestore";
import { Room } from "@/app/atom/lobbyAtom";

export const useTopicMap = () => {
  return useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "topics"));
      const mapping: Record<string, string> = {}; // ✅ Map 대신 일반 객체
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.topicName) mapping[doc.id] = data.topicName;
      });
      return mapping;
    },
    staleTime: Infinity,
  });
};

export const roomQueries = {
  detail: (roomId: string | undefined, queryClient: any) =>
    queryOptions({
      queryKey: ["room", roomId],
      queryFn: async () => {
        const cached = queryClient.getQueryData(["room", roomId]);
        if (cached) return cached as Room;

        return { id: roomId, roomName: "로딩 중..." } as Room;
      },
      enabled: !!roomId,
      staleTime: Infinity,
    }),
};

export const useRoomSubscription = (roomId: string | undefined) => {
  const queryClient = useQueryClient();
  const { data: topicMap } = useTopicMap();
  const queryKey = ["room", roomId];

  useEffect(() => {
    if (!roomId || !topicMap) return;

    const roomDocRef = doc(db, `rooms/${roomId}`);
    const unsubscribe = onSnapshot(roomDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const topics = data.topic ? data.topic.split(", ") : [];
        const roomTopicMap = new Map<string, string>();

        topics.forEach((id: string) => {
          const topicName = topicMap?.[id] || "알 수 없음";
          if (topicName) roomTopicMap.set(id, topicName);
        });

        const roomData: Room = {
          id: docSnap.id,
          ...data,
          topicItem: roomTopicMap,
        } as Room;

        queryClient.setQueryData(queryKey, roomData);
      }
    });

    return () => unsubscribe();
  }, [roomId, topicMap, queryClient]);

  return useQuery(roomQueries.detail(roomId, queryClient));
};
