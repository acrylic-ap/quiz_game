import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/app/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { generateRoomId } from "@/app/lib/utils";
import { useRouter } from "next/navigation";

export const useRoomMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      isEdit,
      roomId,
      data,
    }: {
      isEdit: boolean;
      roomId?: string;
      data: any;
    }) => {
      let finalId = roomId || "";

      if (!isEdit) {
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 10) {
          finalId = generateRoomId();
          const docRef = doc(db, "rooms", finalId);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) isUnique = true;
          attempts++;
        }

        await setDoc(doc(db, "rooms", finalId), {
          ...data,
          createdAt: new Date(),
          capacity: 1,
          playing: false,
        });
      } else if (roomId) {
        // 2. 수정 로직
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, data);
      }

      return finalId;
    },
    onSuccess: (finalId) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      router.push(`/room/${finalId}`);
    },
  });
};
