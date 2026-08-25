import {
  QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { db, rtdb } from "@/lib/firebase";
import { getDocs, collection } from "firebase/firestore";
import { useAuth } from "../../common/account/useAuth";
import { get, onDisconnect, onValue, ref, remove } from "firebase/database";
import { useRoomUsers } from "./useRoomUsers";
import { Room } from "@/types/common/room/room";

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

export const roomQueries = {
  detail: (roomId: string | undefined, queryClient: QueryClient) =>
    queryOptions({
      queryKey: ["room", roomId],
      queryFn: async () => {
        const cached = queryClient.getQueryData<Room>(["room", roomId]);

        return cached ?? null;
      },
      enabled: !!roomId,
      staleTime: Infinity,
    }),
};

export const useRoomSubscription = (roomId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: topicMap } = useTopicMap();
  const { data: user } = useAuth();
  const { data: users } = useRoomUsers(roomId);

  const queryKey = ["room", roomId];

  const [roomStatus, setRoomStatus] = useState<"loading" | "exist" | "lost">(
    "loading",
  );

  useEffect(() => {
    if (!roomId) {
      setRoomStatus("lost");
      return;
    }

    if (!topicMap) return;

    const sessionRef = ref(rtdb, `room_sessions/${roomId}`);

    const unsubscribe = onValue(
      sessionRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          queryClient.setQueryData(queryKey, null);
          setRoomStatus("lost");
          return;
        }

        const data = snapshot.val();

        const ownerId = data.config?.ownerId ?? "";
        const status = data.status ?? "waiting";
        const isPlaying = status === "playing";

        // 대기 중인 방의 방장 이탈 확인
        if (!isPlaying && ownerId) {
          const ownerSessionRef = ref(
            rtdb,
            `room_sessions/${roomId}/users/${ownerId}`,
          );

          const ownerSnap = await get(ownerSessionRef);

          if (!ownerSnap.exists()) {
            await remove(sessionRef);

            setRoomStatus("lost");
            return;
          }
        }

        // 저장된 topic ID → 화면 표시용 Map
        const topicIds = data.gameConfig?.topic
          ? data.gameConfig.topic.split(", ")
          : [];

        const roomTopicMap = new Map<string, string>();

        topicIds.forEach((id: string) => {
          const topicName = topicMap[id];

          if (topicName) {
            roomTopicMap.set(id, topicName);
          }
        });

        const roomData: Room = {
          id: roomId,

          config: {
            roomName: data.config?.roomName ?? "",
            capacity: data.config?.capacity ?? 0,
            maxCapacity: data.config?.maxCapacity ?? 0,
            showPublic: data.config?.showPublic ?? true,
            ownerId,
          },

          status,

          users: users ?? [],

          gameConfig: {
            lastRound: data.gameConfig?.lastRound ?? 0,
            topic: roomTopicMap,
            decision: data.gameConfig?.decision ?? "random",
            rankBasis: data.gameConfig?.rankBasis ?? "count",
          },
        };

        // 브라우저 종료 시 방/사용자 정리
        if (user?.uid) {
          const myEntryRef = ref(
            rtdb,
            `room_sessions/${roomId}/users/${user.uid}`,
          );

          if (isPlaying) {
            onDisconnect(sessionRef)
              .cancel()
              .catch(() => {});

            onDisconnect(myEntryRef)
              .cancel()
              .catch(() => {});
          } else {
            if (ownerId === user.uid) {
              onDisconnect(sessionRef).remove().catch(console.error);
            } else {
              onDisconnect(myEntryRef).remove().catch(console.error);
            }
          }
        }

        queryClient.setQueryData<Room>(queryKey, roomData);

        setRoomStatus("exist");
      },
      (error) => {
        console.error("Room subscription error:", error);

        setRoomStatus("lost");
      },
    );

    return () => unsubscribe();
  }, [roomId, topicMap, queryClient, user?.uid]);

  const queryResult = useQuery<Room | null>({
    queryKey,
    queryFn: () => {
      const cachedData = queryClient.getQueryData<Room>(queryKey);

      return cachedData ?? null;
    },
    enabled: !!roomId,
    staleTime: 0,
    gcTime: 0,
  });

  return {
    ...queryResult,
    roomStatus,
  };
};
