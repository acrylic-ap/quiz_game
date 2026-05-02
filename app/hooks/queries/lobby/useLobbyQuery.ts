import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { db, rtdb } from "@/app/lib/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { LobbyRoom } from "@/app/atom/lobbyAtom";
import { onValue, ref, Unsubscribe } from "firebase/database";

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
  const queryKey = useMemo(() => ["rooms"], []);

  useEffect(() => {
    if (!topicMap) return;

    const roomsCollection = collection(db, "rooms");
    const rtdbUnsubscribes: Record<string, Unsubscribe> = {};

    // 1. Firestore: 방 목록 실시간 구독
    const unsubscribeFirestore = onSnapshot(roomsCollection, (snapshot) => {
      const activeRooms = snapshot.docs.filter(
        (doc) => doc.data().showPublic !== false,
      );
      // 삭제된 방 리스너 정리
      const activeIds = activeRooms.map((doc) => doc.id);

      queryClient.setQueryData<LobbyRoom[]>(queryKey, (old = []) => {
        return old.filter((room) => activeIds.includes(room.id));
      });

      Object.keys(rtdbUnsubscribes).forEach((id) => {
        if (!activeIds.includes(id)) {
          rtdbUnsubscribes[id]();
          delete rtdbUnsubscribes[id];
        }
      });

      // 2. 각 방별 RTDB 인원수 실시간 구독
      activeRooms.forEach((doc) => {
        const roomId = doc.id;
        const data = doc.data();

        // 리스너가 이미 있으면 설정 패스
        if (rtdbUnsubscribes[roomId]) return;

        const usersRef = ref(rtdb, `room_sessions/${roomId}/users`);

        // [핵심] onValue는 내부에서 변화가 생길 때마다 이 콜백을 다시 실행함
        rtdbUnsubscribes[roomId] = onValue(usersRef, (userSnapshot) => {
          const capacity = userSnapshot.exists()
            ? Object.keys(userSnapshot.val()).length
            : 0;

          const topicParts = (data.topic || "").split(", ");
          const firstTopicName = topicMap[topicParts[0]] || "알 수 없는 주제";
          const topicName =
            topicParts.length > 1
              ? `${firstTopicName} 외 ${topicParts.length - 1}개`
              : firstTopicName;

          const updatedRoom: LobbyRoom = {
            id: roomId,
            topicName,
            playing: data.playing,
            decision: data.decision,
            roomName: data.roomName,
            maxCapacity: data.maxCapacity,
            internalValue: data.internalValue,
            capacity, // RTDB에서 실시간으로 받아온 인원
          };

          // 3. 캐시 업데이트: 해당 방 정보만 교체 (참조값을 바꿔서 UI 갱신 유도)
          queryClient.setQueryData<LobbyRoom[]>(queryKey, (old = []) => {
            const index = old.findIndex((r) => r.id === roomId);
            if (index > -1) {
              const next = [...old];
              next[index] = updatedRoom;
              return next;
            }
            return [...old, updatedRoom];
          });
        });
      });
    });

    return () => {
      unsubscribeFirestore();
      Object.values(rtdbUnsubscribes).forEach((unsub) => unsub());
    };
  }, [topicMap, queryClient, queryKey]);

  return useQuery<LobbyRoom[]>({
    queryKey,
    queryFn: () => queryClient.getQueryData<LobbyRoom[]>(queryKey) || [],
    staleTime: 0,
  });
};
