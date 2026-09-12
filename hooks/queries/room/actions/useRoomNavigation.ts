// @/hooks/useRoomNavigation.ts
import { preventClickState } from "@/atoms/modalAtom";
import { rtdb } from "@/lib/firebase";
import { LobbyRoom } from "@/types/lobby/room";
import { get, ref, runTransaction } from "firebase/database";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";

export const useRoomNavigation = (
  user: any,
  setAlertModal: (msg: string) => void,
) => {
  const [, setPreventClick] = useAtom(preventClickState);

  const router = useRouter();

  const handleEnterRoom = async (room: LobbyRoom | undefined) => {
    if (!user) {
      setPreventClick(false);
      return setAlertModal("로그인 후 이용해주세요!");
    }
    if (!room) {
      setPreventClick(false);
      return setAlertModal("방 정보를 찾을 수 없습니다.");
    }

    const roomId = room.id;

    if (!roomId || !user?.uid) return;

    const kickedRef = ref(rtdb, `room_sessions/${roomId}/kicked/${user.uid}`);

    const snapshot = await get(kickedRef);

    if (snapshot.exists() && snapshot.val() === true) {
      setPreventClick(false);
      return setAlertModal("퇴장된 방은 재입장이 불가능합니다.");
    }

    const sessionRef = ref(rtdb, `room_sessions/${room.id}`);
    const userRef = ref(rtdb, `room_sessions/${room.id}/users/${user.uid}`);

    try {
      const sessionSnapshot = await get(sessionRef);
      const session = sessionSnapshot.val();

      if (!session) {
        setPreventClick(false);
        return setAlertModal("이미 삭제된 방입니다.");
      }

      if (session.status === "playing") {
        setPreventClick(false);
        return setAlertModal("이미 진행 중인 방입니다.");
      }

      const currentUsers = session.users ?? {};
      const alreadyJoined = currentUsers[user.uid] !== undefined;

      if (!alreadyJoined && Object.keys(currentUsers).length >= room.maxCapacity) {
        setPreventClick(false);
        return setAlertModal("인원이 가득 찼습니다.");
      }

      const result = await runTransaction(userRef, (currentUser) => {
        if (currentUser) {
          return currentUser;
        }

        return {
          nickname: user.nickname,
          isOwner: false,
          isReady: false,
          joinedAt: Date.now(),
        };
      });

      if (!result.committed) {
        setPreventClick(false);
        return setAlertModal("입장에 실패했습니다.");
      }

      setPreventClick(false);

      router.replace(`/room/${room.id}`);
    } catch (error: any) {
      console.error("입장 처리 중 에러:", error);
      setAlertModal("입장 처리 중 오류가 발생했습니다.");
    }
  };

  return { handleEnterRoom };
};
