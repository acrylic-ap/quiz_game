import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { onValue, ref } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { Chat } from "@/types/room/chat";

export const useChatMessages = (roomId: string | undefined) => {
  const queryClient = useQueryClient();
  const queryKey = ["chats", roomId];

  useEffect(() => {
    if (!roomId) return;

    const chatsRef = ref(rtdb, `chats/${roomId}`);

    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        queryClient.setQueryData<Chat[]>(queryKey, []);
        return;
      }

      const messageData: Chat[] = Object.entries(data).map(([id, value]) => {
        const chat = value as {
          username: string;
          text: string;
          time: number;
          isAdmin?: boolean;
        };

        return {
          id,
          username: chat.username,
          text: chat.text,
          time: new Date(chat.time).toLocaleTimeString("ko-KR", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          }),
          isAdmin: chat.isAdmin ?? false,
        };
      });

      queryClient.setQueryData<Chat[]>(queryKey, messageData);
    });

    return () => unsubscribe();
  }, [roomId, queryClient]);

  return useQuery<Chat[]>({
    queryKey,
    queryFn: () => queryClient.getQueryData<Chat[]>(queryKey) ?? [],
    enabled: !!roomId,
    staleTime: Infinity,
  });
};
