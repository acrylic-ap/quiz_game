import { useMutation } from "@tanstack/react-query";
import { push, ref, serverTimestamp, set } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useAtomValue } from "jotai";
import { currentRoomIdAtom } from "@/atoms/roomAtom";

export const useSendMessage = () => {
  const roomId = useAtomValue(currentRoomIdAtom);

  return useMutation({
    mutationFn: async ({
      username,
      text,
      isAdmin,
    }: {
      username: string;
      text: string;
      isAdmin?: boolean;
    }) => {
      if (!roomId) {
        throw new Error("roomId가 없습니다.");
      }

      const chatsRef = ref(rtdb, `chats/${roomId}`);
      const chatRef = push(chatsRef);

      await set(chatRef, {
        username,
        text,
        time: serverTimestamp(),
        isAdmin: isAdmin ?? false,
      });
    },

    onError: (error: any) => {
      console.error("전송 에러:", error);

      alert(
        error.code === "PERMISSION_DENIED"
          ? "권한이 없습니다."
          : "네트워크 오류",
      );
    },
  });
};
