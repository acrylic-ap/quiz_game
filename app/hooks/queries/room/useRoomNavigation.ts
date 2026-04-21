// @/app/hooks/useRoomNavigation.ts
import { LobbyRoom } from "@/app/atom/lobbyAtom";
import { rtdb } from "@/app/lib/firebase";
import { ref, serverTimestamp, update } from "firebase/database";
import { useRouter } from "next/navigation";

export const useRoomNavigation = (
  user: any,
  setAlertModal: (msg: string) => void,
) => {
  const router = useRouter();

  const handleEnterRoom = async (room: LobbyRoom | undefined) => {
    // 1. 기본 검증
    if (!user) return setAlertModal("로그인 후 이용해주세요!");
    if (!room) return setAlertModal("존재하지 않거나 삭제된 방입니다.");

    // 2. 상태 검증
    if (room.playing) {
      setAlertModal("이미 진행 중인 방입니다!");
      return;
    }

    if (room.capacity >= room.maxCapacity) {
      setAlertModal("인원이 꽉 찼습니다!");
      return;
    }

    // 3. 통과 시 입장
    try {
      // 2. RTDB에 내 정보 등록 (유저 값 넣기)
      // 방장은 이미 생성 시점에 들어가 있으므로, 여기서는 '참여자'로서의 내 정보를 넣습니다.
      const userEntryRef = ref(
        rtdb,
        `room_sessions/${room.id}/users/${user.uid}`,
      );

      await update(userEntryRef, {
        nickname: user.nickname,
        isOwner: false, // 리스트를 통해 들어오는 유저는 무조건 참여자
        isReady: false, // 입장 초기값은 대기 상태
        joinedAt: serverTimestamp(),
        // avatar: user.avatar || "👤", // 아바타 정보가 있다면 추가
      });

      // 3. 통과 시 이동
      router.push(`/room/${room.id}`);
    } catch (error) {
      console.error("방 입장 데이터 업데이트 실패:", error);
      setAlertModal("방에 입장하는 도중 오류가 발생했습니다.");
    }
  };

  return { handleEnterRoom };
};
