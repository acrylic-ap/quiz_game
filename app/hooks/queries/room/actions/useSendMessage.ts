import { useMutation } from "@tanstack/react-query";
import { db } from "@/app/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useAtomValue } from "jotai";
import { currentRoomIdAtom } from "@/app/atoms/roomAtom";

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
      if (!roomId) throw new Error("roomId가 없습니다.");
      const docRef = collection(db, `rooms/${roomId}/chats`);
      await addDoc(docRef, {
        username,
        text,
        time: new Date(),
        isAdmin: isAdmin ?? false,
      });
    },
    onError: (error: any) => {
      console.error("전송 에러:", error);
      alert(
        error.code === "permission-denied"
          ? "권한이 없습니다."
          : "네트워크 오류",
      );
    },
  });
};
