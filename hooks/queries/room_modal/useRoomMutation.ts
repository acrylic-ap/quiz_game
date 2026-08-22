import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db, rtdb } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, set, update } from "firebase/database";
import { generateRoomId } from "@/utils/generateRoomId";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { alertModalState, preventClickState } from "@/atoms/modalAtom";
import { useAuth } from "@/hooks/queries/common/account/useAuth";

export const useRoomMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [, setAlertModal] = useAtom(alertModalState);
  const [, setPreventClick] = useAtom(preventClickState);
  const { data: user } = useAuth();

  const createRoom = useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error("로그인이 필요합니다.");

      setPreventClick(true);

      let customId = "";
      let isUnique = false;

      while (!isUnique) {
        customId = generateRoomId();
        const docRef = doc(db, "rooms", customId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) isUnique = true;
      }

      await setDoc(doc(db, "rooms", customId), {
        ...data,
        capacity: 1,
        ownerId: user.uid,
        createdAt: new Date(),
        playing: false,
      });

      await set(ref(rtdb, `room_sessions/${customId}`), {
        status: "waiting",
        currentRound: 0,
        config: {
          roomName: data.roomName,
          maxCapacity: data.maxCapacity,
          rank: data.rank,
        },
        users: {
          [user.uid]: {
            nickname: user.nickname,
            isOwner: true,
            jointedAt: serverTimestamp(),
          },
        },
        messages: {},
      });

      return customId;
    },
    onSuccess: (customId) => {
      setPreventClick(false);
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      router.replace(`/room/${customId}`);
    },
    onError: (error: any) => {
      setPreventClick(false);
      console.error("방 생성 에러:", error);
      setAlertModal("방 생성 중 오류가 발생했습니다.");
    },
  });

  const updateRoom = useMutation({
    mutationFn: async ({ roomId, data }: { roomId: string; data: any }) => {
      const docRef = doc(db, "rooms", roomId);
      await updateDoc(docRef, data);

      await update(ref(rtdb, `room_sessions/${roomId}/config`), {
        roomName: data.roomName,
        maxCapacity: data.maxCapacity,
        rank: data.rank,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error: any) => {
      console.error("방 수정 에러:", error);
      setAlertModal("방 정보를 수정하는데 실패했습니다.");
    },
  });

  return { createRoom, updateRoom };
};
