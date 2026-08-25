import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { db, rtdb } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { onValue, ref } from "firebase/database";
import { LobbyRoom } from "@/types/common/lobby/room";

export const useTopicMap = () => {
  return useQuery({
    queryKey: ["topicMap"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "topics"));

      const mapping: Record<string, string> = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.topicName) {
          mapping[doc.id] = data.topicName;
        }
      });

      return mapping;
    },
    staleTime: Infinity,
  });
};

export const useRoomList = () => {
  const queryClient = useQueryClient();
  const { data: topicMap } = useTopicMap();

  const queryKey = ["rooms"];

  useEffect(() => {
    if (!topicMap) return;

    const roomsRef = ref(rtdb, "room_sessions");

    const unsubscribe = onValue(
      roomsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          queryClient.setQueryData<LobbyRoom[]>(queryKey, []);

          return;
        }

        const roomsData = snapshot.val();

        const rooms: LobbyRoom[] = Object.entries(roomsData)
          .map(([roomId, value]) => {
            const data = value as any;

            // 공개 방만 로비에 표시
            if (data.config?.showPublic === false) {
              return null;
            }

            const topicParts = data.gameConfig?.topic
              ? data.gameConfig.topic.split(", ")
              : [];

            const firstTopicName = topicMap[topicParts[0]] || "알 수 없는 주제";

            const topicName =
              topicParts.length > 1
                ? `${firstTopicName} 외 ${topicParts.length - 1}개`
                : firstTopicName;

            return {
              id: roomId,
              topicName,
              status: data.status ?? "waiting",
              roomName: data.config?.roomName ?? "",
              capacity: data.config?.capacity ?? 0,
              maxCapacity: data.config?.maxCapacity ?? 0,
              lastRound: data.gameConfig?.lastRound ?? 0,
            };
          })
          .filter((room): room is LobbyRoom => room !== null);

        queryClient.setQueryData<LobbyRoom[]>(queryKey, rooms);
      },
      (error) => {
        console.error("Room list subscription error:", error);

        queryClient.setQueryData<LobbyRoom[]>(queryKey, []);
      },
    );

    return () => unsubscribe();
  }, [topicMap, queryClient]);

  return useQuery<LobbyRoom[]>({
    queryKey,
    queryFn: () => queryClient.getQueryData<LobbyRoom[]>(queryKey) ?? [],
    enabled: !!topicMap,
    staleTime: 0,
  });
};
