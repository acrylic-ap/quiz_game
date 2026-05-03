// @/app/hooks/useRoomNavigation.ts
import { LobbyRoom } from "@/app/atom/lobbyAtom";
import { preventClickState } from "@/app/atom/modalAtom";
import { rtdb } from "@/app/lib/firebase";
import { get, onValue, ref, runTransaction } from "firebase/database";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";

export const useRoomNavigation = (
  user: any,
  setAlertModal: (msg: string) => void,
) => {
  const [preventClick, setPreventClick] = useAtom(preventClickState);

  const router = useRouter();

  const handleEnterRoom = async (room: LobbyRoom | undefined) => {
    if (!user) return setAlertModal("로그인 후 이용해주세요!");
    if (!room) return setAlertModal("방 정보를 찾을 수 없습니다.");

    const roomId = room.id;

    if (!roomId || !user?.uid) return;

    const kickedRef = ref(rtdb, `room_sessions/${roomId}/kicked/${user.uid}`);

    const snapshot = await get(kickedRef);

    if (snapshot.exists() && snapshot.val() === true) {
      setPreventClick(false);
      return setAlertModal("퇴장된 방은 재입장이 불가능합니다.");
    }

    // 세션의 메타데이터와 유저 리스트를 한꺼번에 체크하는 트랜잭션
    const sessionRef = ref(rtdb, `room_sessions/${room.id}`);

    try {
      const result = await runTransaction(sessionRef, (currentData) => {
        // 1. 방이 존재하는지 확인 (이미 삭제되었다면 null)
        if (!currentData) {
          return null;
        }

        // 조건에 걸리면 아무것도 리턴하지 않거나(abort), 현재 데이터를 그대로 리턴
        if (
          currentData.status == "playing" ||
          Object.keys(currentData.users || {}).length >= room.maxCapacity
        ) {
          return; // 트랜잭션 중단 (committed: false)
        }

        // 4. 모든 조건 통과 시 데이터 업데이트
        // 여기서 내 정보를 추가한 객체를 반환하면 원자적으로 업데이트됩니다.
        return {
          ...currentData,
          users: {
            ...currentData.users,
            [user.uid]: {
              nickname: user.nickname,
              isOwner: false,
              isReady: false,
              joinedAt: Date.now(), // 트랜잭션 내에선 serverTimestamp() 대신 일반 Date 권장
            },
          },
        };
      });

      if (!result.committed) {
        setPreventClick(false);

        // 왜 실패했는지 한 번 더 확인 (필요시 get으로 다시 찌르거나, snapshot 데이터 활용)
        const finalCheck = await get(sessionRef);
        const data = finalCheck.val();

        console.log(data.status);

        if (!data) return setAlertModal("이미 삭제된 방입니다.");
        if (data.status == "playing")
          return setAlertModal("이미 진행 중인 방입니다.");
        if (Object.keys(data.users || {}).length >= room.maxCapacity)
          return setAlertModal("인원이 가득 찼습니다.");

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
