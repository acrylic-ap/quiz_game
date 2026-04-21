// @/app/hooks/queries/room/useRoomUsers.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ref, onValue, off } from "firebase/database";
import { rtdb } from "@/app/lib/firebase";
import { useEffect, useMemo } from "react";

export interface RoomUser {
  id: string;
  nickname: string;
  isOwner: boolean;
  isReady: boolean;
  joinedAt: number | object;
  avatar?: string;
}

export const useRoomUsers = (roomId: string | undefined) => {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["room_users", roomId], [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const usersRef = ref(rtdb, `room_sessions/${roomId}/users`);
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const userList: RoomUser[] = data 
        ? Object.entries(data).map(([uid, info]: [string, any]) => ({
            id: uid,
            ...info,
          }))
        : [];
      
      queryClient.setQueryData<RoomUser[]>(queryKey, userList);
    });

    return () => off(usersRef);
  }, [roomId, queryClient, queryKey]);

  // 원본 배열 데이터를 가져옵니다.
  const queryResult = useQuery<RoomUser[], Error>({
    queryKey,
    queryFn: () => [],
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // 3번 예시의 핵심: 배열을 UID 기반 객체(Map)로 가공
  // useMemo를 사용하여 users 데이터가 변할 때만 다시 계산합니다.
  const userMap = useMemo(() => {
    return (queryResult.data || []).reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, RoomUser>);
  }, [queryResult.data]);

  return {
    users: queryResult.data || [], // 배열 형태 (UI map용)
    userMap,                       // 객체 형태 (권한 체크용)
    ...queryResult,                // isLoading, error 등 기존 useQuery 속성
  };
};