"use client";

import {
  QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { db, rtdb } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../../common/account/useAuth";
import { onDisconnect, onValue, ref } from "firebase/database";
import { useRoomUsers } from "./useRoomUsers";
import { Room } from "@/types/room/room";

export const useTopicMap = () => {
  return useQuery({
    queryKey: ["roomTopicDetails"],
    queryFn: async () => {
      const querySnapshot = await getDocs(
        query(
          collection(db, "topics"),
          where("approvalStatus", "==", "approved"),
        ),
      );

      const mapping: Record<
        string,
        { topicName: string; description: string; category: string }
      > = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.topicName) {
          mapping[doc.id] = {
            topicName: data.topicName,
            description: data.description ?? "",
            category: data.category ?? "",
          };
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

        const topicIds = data.gameConfig?.topic
          ? data.gameConfig.topic.split(", ")
          : [];

        const roomTopicMap = new Map<string, string>();
        const roomTopicDescriptionMap = new Map<string, string>();
        const roomTopicCategoryMap = new Map<string, string>();

        topicIds.forEach((id: string) => {
          const topic = topicMap?.[id];

          if (topic) {
            roomTopicMap.set(id, topic.topicName);
            roomTopicDescriptionMap.set(id, topic.description);
            roomTopicCategoryMap.set(id, topic.category);
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

            topicDescriptions: roomTopicDescriptionMap,

            topicCategories: roomTopicCategoryMap,

            decision: data.gameConfig?.decision ?? "random",

            rankBasis: data.gameConfig?.rankBasis ?? "count",
          },

          game: {
            status: data.game?.status ?? "waiting",

            currentRound: data.game?.currentRound ?? 0,

            selectedTopicId: data.game?.selectedTopicId ?? undefined,

            questionList: data.game?.questionList ?? [],

            topicVotes: data.game?.topicVotes ?? {},

            joinReady: data.game?.joinReady ?? {},

            finalReturnReady: data.game?.finalReturnReady ?? {},
          },
        };

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
  }, [roomId, topicMap, queryClient, user?.uid, users]);

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
