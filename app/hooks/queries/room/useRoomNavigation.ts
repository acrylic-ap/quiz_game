// @/app/hooks/useRoomNavigation.ts
import { LobbyRoom } from "@/app/atom/lobbyAtom";
import { rtdb } from "@/app/lib/firebase";
import { ref, runTransaction } from "firebase/database";
import { useRouter } from "next/navigation";

export const useRoomNavigation = (
  user: any,
  setAlertModal: (msg: string) => void,
) => {
  const router = useRouter();

  const handleEnterRoom = async (room: LobbyRoom | undefined) => {
    if (!user) return setAlertModal("로그인 후 이용해주세요!");
    if (!room) return setAlertModal("방 정보를 찾을 수 없습니다.");

    // 세션의 메타데이터와 유저 리스트를 한꺼번에 체크하는 트랜잭션
    const sessionRef = ref(rtdb, `room_sessions/${room.id}`);

    try {
      const result = await runTransaction(sessionRef, (currentData) => {
        // 1. 방이 존재하는지 확인 (이미 삭제되었다면 null)
        if (!currentData) {
          return null;
        }

        // 2. 이미 게임이 시작되었는지 확인
        if (currentData.playing) {
          throw new Error("ALREADY_PLAYING");
        }

        // 3. 인원수 체크 (현재 유저 목록의 길이를 확인)
        const users = currentData.users || {};
        const currentCount = Object.keys(users).length;
        if (currentCount >= room.maxCapacity) {
          throw new Error("ROOM_FULL");
        }

        // 4. 모든 조건 통과 시 데이터 업데이트
        // 여기서 내 정보를 추가한 객체를 반환하면 원자적으로 업데이트됩니다.
        return {
          ...currentData,
          users: {
            ...users,
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
        return setAlertModal("존재하지 않거나 삭제된 방입니다.");
      }

      router.replace(`/room/${room.id}`);
    } catch (error: any) {
      if (error.message === "ALREADY_PLAYING") {
        setAlertModal("이미 진행 중인 방입니다!");
      } else if (error.message === "ROOM_FULL") {
        setAlertModal("인원이 꽉 찼습니다!");
      } else {
        console.error("입장 처리 중 에러:", error);
        setAlertModal("입장 처리 중 오류가 발생했습니다.");
      }
    }
  };

  return { handleEnterRoom };
};
