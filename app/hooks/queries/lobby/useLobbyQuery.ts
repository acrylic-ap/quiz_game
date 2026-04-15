import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { LobbyRoom } from "@/app/atom/lobbyAtom";

// 1. 토픽 매핑 데이터 가져오기 (정적)
export const useTopicMap = () => {
  return useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "topics"));
      const mapping: Record<string, string> = {};
      querySnapshot.forEach((doc) => {
        mapping[doc.id] = doc.data().topicName;
      });
      return mapping;
    },
    staleTime: Infinity,
  });
};

// 2. 실시간 방 목록 구독
export const useRoomList = () => {
  const queryClient = useQueryClient();
  const { data: topicMap } = useTopicMap();
  const queryKey = ["rooms"];

  useEffect(() => {
    if (!topicMap) return;

    const roomsCollection = collection(db, "rooms");
    const unsubscribe = onSnapshot(roomsCollection, (snapshot) => {
      const roomsData: LobbyRoom[] = snapshot.docs
        .filter((doc) => doc.data().showPublic !== false)
        .map((doc) => {
          const data = doc.data();
          const topicParts = (data.topic || "").split(", ");
          const firstTopicName = topicMap[topicParts[0]] || "알 수 없는 주제";

          const topicName =
            topicParts.length > 1
              ? `${firstTopicName} 외 ${topicParts.length - 1}개`
              : firstTopicName;

          return {
            id: doc.id,
            roomName: data.roomName,
            topicName,
            capacity: data.capacity,
            maxCapacity: data.maxCapacity,
            playing: data.playing,
            decision: data.decision,
            internalValue: data.internalValue,
          };
        });
      queryClient.setQueryData(queryKey, roomsData);
    });

    return () => unsubscribe();
  }, [topicMap, queryClient]);

  return useQuery<LobbyRoom[]>({
    queryKey,
    queryFn: () => queryClient.getQueryData<LobbyRoom[]>(queryKey) || [],
    enabled: !!topicMap,
  });
};
