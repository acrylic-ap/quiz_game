import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Room } from "@/types/room/room";

export const useRoomDetail = (roomId: string | null) => {
  return useQuery<Room | null>({
    queryKey: ["rooms", roomId],
    queryFn: async () => {
      if (!roomId) return null;

      const docRef = doc(db, "rooms", roomId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      const data = docSnap.data();

      return {
        id: docSnap.id,
        roomName: data.roomName || "",
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
