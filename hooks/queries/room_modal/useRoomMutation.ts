import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ref, set, update, serverTimestamp } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { generateRoomId } from "@/utils/generateRoomId";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { alertModalState, preventClickState } from "@/atoms/modalAtom";
import { useAuth } from "@/hooks/queries/common/account/useAuth";
import { TopicDecisionType } from "@/types/topic/topic";
import { RankBasis } from "@/types/room/room";

interface RoomPayload {
  config: {
    roomName: string;
    maxCapacity: number;
    showPublic: boolean;
  };
  gameConfig: {
    lastRound: number;
    topic: string;
    decision: TopicDecisionType;
    rankBasis: RankBasis;
  };
}

export const useRoomMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [, setAlertModal] = useAtom(alertModalState);
  const [, setPreventClick] = useAtom(preventClickState);

  const { data: user } = useAuth();

  const createRoom = useMutation({
    mutationFn: async (data: RoomPayload) => {
      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }

      setPreventClick(true);

      const roomId = generateRoomId();

      const roomRef = ref(rtdb, `room_sessions/${roomId}`);

      await set(roomRef, {
        status: "waiting",
        currentRound: 0,

        config: {
          ...data.config,
          capacity: 1,
          ownerId: user.uid,
        },

        gameConfig: data.gameConfig,

        users: {
          [user.uid]: {
            nickname: user.nickname,
            jointedAt: serverTimestamp(),
          },
        },
      });

      return roomId;
    },

    onSuccess: (roomId) => {
      setPreventClick(false);

      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });

      router.replace(`/room/${roomId}`);
    },

    onError: (error: any) => {
      setPreventClick(false);

      console.error("방 생성 에러:", error);
      setAlertModal("방 생성 중 오류가 발생했습니다.");
    },
  });

  const updateRoom = useMutation({
    mutationFn: async ({
      roomId,
      data,
    }: {
      roomId: string;
      data: RoomPayload;
    }) => {
      const roomRef = ref(rtdb, `room_sessions/${roomId}`);

      await update(roomRef, {
        "config/roomName": data.config.roomName,
        "config/maxCapacity": data.config.maxCapacity,
        "config/showPublic": data.config.showPublic,

        "gameConfig/lastRound": data.gameConfig.lastRound,
        "gameConfig/topic": data.gameConfig.topic,
        "gameConfig/decision": data.gameConfig.decision,
        "gameConfig/rankBasis": data.gameConfig.rankBasis,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },

    onError: (error: any) => {
      console.error("방 정보 수정 에러:", error);
      setAlertModal("방 정보를 수정하는데 실패했습니다.");
    },
  });

  return {
    createRoom,
    updateRoom,
  };
};
