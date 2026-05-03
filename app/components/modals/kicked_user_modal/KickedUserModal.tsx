"use client";

import { selectModalState, showBlockedModalState } from "@/app/atom/modalAtom";
import { useUsers } from "@/app/hooks/queries/common/useUsers";
import { useRoomList } from "@/app/hooks/queries/lobby/useLobbyQuery";
import { useRoomKickedUsers } from "@/app/hooks/queries/room/useRoomKickedUsers";
import { rtdb } from "@/app/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ref, remove } from "firebase/database";
import { useAtom } from "jotai";
import { LockKeyholeOpen } from "lucide-react";
import { usePathname } from "next/navigation";

export default function BlockedModal() {
  const [showBlockedModal, setShowBlockedModal] = useAtom(
    showBlockedModalState,
  );

  const [, setSelectedModal] = useAtom(selectModalState);

  const roomId = usePathname().split("/").pop();

  if (!roomId) return null;

  const { data: user } = useRoomKickedUsers(roomId); // 실제 roomId로 대체 필요
  const { data: users } = useUsers();

  const handleUnKickUser = (username: string, userId: string) => {
    setSelectedModal({
      message: `[${username}]
해당 유저를 차단 해제하시겠습니까?`,
      onConfirm: () => {
        const kickedUsersRef = ref(
          rtdb,
          `room_sessions/${roomId}/kicked/${userId}`,
        );

        // RTDB에서 해당 유저 제거
        remove(kickedUsersRef);
        setSelectedModal(null);
      },
    }); // 모달 닫기
  };

  return (
    <Dialog open={showBlockedModal} onOpenChange={setShowBlockedModal}>
      <DialogContent className="bg-zinc-950 text-zinc-100 select-none">
        <DialogHeader className="text-center mt-5">
          <DialogTitle className="text-2xl">강제 퇴장된 유저</DialogTitle>
        </DialogHeader>

        <div
          className="flex flex-col items-center
                    h-40 text-lg overflow-y-auto
                    no-scrollbar"
        >
          {user && user.length > 0 ? (
            user.map((userId) => {
              const user = users?.find((u) => u.id === userId);
              if (!user) return null;

              return (
                <div className="flex items-center gap-4 mb-4">
                  <p>{user.name}</p>

                  <LockKeyholeOpen
                    color="gray"
                    onClick={() => handleUnKickUser(user.name, user.id)}
                  />
                </div>
              );
            })
          ) : (
            <p>현재 강제 퇴장된 유저가 없습니다.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
