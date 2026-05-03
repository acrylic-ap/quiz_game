import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/app/lib/firebase";

export const useRoomKickedUsers = (roomId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["roomKickedUsers", roomId];

  // 1. TanStack Query 설정
  const query = useQuery({
    queryKey,
    queryFn: () => {
      // 초기 데이터를 가져오거나, 실시간 리스너가 채워줄 캐시를 기다림
      return [];
    },
    enabled: !!roomId,
    staleTime: Infinity, // 실시간으로 관리되므로 자동 만료 방지
  });

  // 2. 실시간 리스너 연결 (물리적 실전 로직)
  useEffect(() => {
    if (!roomId) return;

    const kickedUsersRef = ref(rtdb, `room_sessions/${roomId}/kicked`);

    // RTDB 값이 바뀔 때마다 TanStack Query 캐시를 강제로 갱신
    const unsubscribe = onValue(kickedUsersRef, (snapshot) => {
      const data = snapshot.val();
      // 데이터가 객체 형태({uid: true})라면 Object.keys 등으로 변환 필요
      const kickedList = data ? Object.keys(data) : [];
      queryClient.setQueryData(queryKey, kickedList);
    });

    return () => unsubscribe(); // 언마운트 시 리스너 해제
  }, [roomId, queryClient]);

  return query;
};
