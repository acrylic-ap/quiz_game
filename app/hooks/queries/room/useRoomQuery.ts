import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { db, rtdb } from "@/app/lib/firebase";
import {
  doc,
  onSnapshot,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { Room } from "@/app/atom/lobbyAtom";
import { useUser } from "../lobby/useAuth";
import { get, onDisconnect, ref } from "firebase/database";
import { useRoomUsers } from "./useRoomUsers";

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
  const { data: user } = useUser();
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

    const roomDocRef = doc(db, `rooms/${roomId}`);
    const sessionRef = ref(rtdb, `room_sessions/${roomId}`);

    // 1. Firestore 실시간 구독 시작
    const unsubscribe = onSnapshot(
      roomDocRef,
      async (docSnap) => {
        const firestoreExists = docSnap.exists();

        if (!firestoreExists) {
          queryClient.setQueryData(queryKey, null);
          setRoomStatus("lost");
          return;
        }

        const data = docSnap.data();
        const ownerId = data.ownerId;

        const ownerSessionRef = ref(
          rtdb,
          `room_sessions/${roomId}/users/${ownerId}`,
        );
        const ownerSnap = await get(ownerSessionRef);
        const isOwnerPresent = ownerSnap.exists();

        if (!isOwnerPresent) {
          console.log("방장 부재 감지: 유령 방을 정리합니다.");
          await deleteDoc(roomDocRef);
          // RTDB의 해당 방 세션 전체도 깔끔하게 삭제 (선택 사항)
          setRoomStatus("lost");
          return;
        }

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

        // 5. 🚀 비상 탈출 장치(onDisconnect) 예약
        if (user?.uid) {
          const myEntryRef = ref(
            rtdb,
            `room_sessions/${roomId}/users/${user.uid}`,
          );

          if (data.ownerId === user.uid) {
            // 방장인 경우: 연결 끊기면 방 세션 전체 삭제
            onDisconnect(sessionRef).remove().catch(console.error);
          } else {
            // 일반 유저인 경우: 연결 끊기면 내 정보만 삭제
            onDisconnect(myEntryRef).remove().catch(console.error);
          }
        }

        // 상태 업데이트 및 캐싱
        queryClient.setQueryData(queryKey, roomData);
        setRoomStatus("exist");
      },
      (error) => {
        console.error("Subscription Error:", error);
        setRoomStatus("lost");
      },
    );

    return () => unsubscribe();
  }, [roomId, topicMap, queryClient, user?.uid, users]);

  // TanStack Query와 연동 (이미 정의하신 roomQueries 사용)
  // 여기서는 기본 queryResult만 반환하도록 작성했습니다.
  const queryResult = useQuery({
    queryKey,
    queryFn: () => {
      const cachedData = queryClient.getQueryData<Room>(queryKey);
      // 캐시된 데이터가 없으면 undefined 대신 null을 반환해서 에러를 방지합니다.
      return cachedData ?? null;
    },
    // roomId가 있을 때만 쿼리를 활성화
    enabled: !!roomId,
    // onSnapshot이 데이터를 실시간으로 넣어주고 있으므로,
    // React Query가 독자적으로 다시 fetch(refetch)하지 않도록 설정
    staleTime: 0,
    gcTime: 0,
  });

  return {
    ...queryResult,
    roomStatus,
  };
};
