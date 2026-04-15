import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Chat } from "@/app/atom/lobbyAtom";

export const useChatMessages = (roomId: string | undefined) => {
  const queryClient = useQueryClient();
  const queryKey = ["chats", roomId];

  useEffect(() => {
    if (!roomId) return;

    const chatsCollection = collection(db, `rooms/${roomId}/chats`);
    const q = query(chatsCollection, orderBy("time", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData: Chat[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          username: data.username,
          text: data.text,
          time: data.time?.toDate().toLocaleTimeString("ko-KR") || "방금 전",
          isAdmin: data.isAdmin,
        };
      });

      // ✅ React Query 캐시를 실시간으로 업데이트
      queryClient.setQueryData(queryKey, messageData);
    });

    return () => unsubscribe();
  }, [roomId, queryClient]);

  return useQuery<Chat[]>({
    queryKey,
    // 초기 캐시가 없을 때 undefined 에러 방지를 위해 빈 배열 반환
    queryFn: () => queryClient.getQueryData<Chat[]>(queryKey) || [],
    staleTime: Infinity,
  });
};
