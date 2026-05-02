import { useQuery } from "@tanstack/react-query";
import { db } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Room } from "@/app/atom/lobbyAtom";

export const useRoomDetail = (roomId: string | null) => {
  return useQuery<Room | null>({
    queryKey: ["rooms", roomId],
    queryFn: async () => {
      if (!roomId) return null;

      const docRef = doc(db, "rooms", roomId);
      const docSnap = await getDoc(docRef);

      console.log(docSnap.exists());

      if (!docSnap.exists()) return null;

      const data = docSnap.data();

      // ✅ Record<string, string> 규격을 그대로 유지하여 반환
      return {
        id: docSnap.id,
        roomName: data.roomName || "",
        // Firestore의 객체를 그대로 사용하되, 없을 경우 빈 객체({}) 제공
        topicItem: data.topic || {},
        capacity: data.capacity || 0,
        maxCapacity: data.maxCapacity || 2,
        playing: data.playing || false,
        decision: data.decision || "random",
        internalValue: data.internalValue || 0,
        showPublic: data.showPublic ?? true,
        rank: data.rank || "count",
      } as Room;
    },
    enabled: !!roomId,
  });
};
