"use client";

import { showKickedModalState } from "@/app/atoms/modalAtom";
import { currentRoomIdAtom } from "@/app/atoms/roomAtom";
import { useUsers } from "@/app/hooks/queries/common/account/useUsers";
import { useUnkickUser } from "@/app/hooks/queries/room/actions/useUnkickUser";
import { useRoomKickedList } from "@/app/hooks/queries/room/session/useRoomKickedList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAtom, useAtomValue } from "jotai";
import { LockKeyholeOpen } from "lucide-react";

export default function KickedListModal() {
  const roomId = useAtomValue(currentRoomIdAtom);

  const [showKickedModal, setShowKickedModal] = useAtom(showKickedModalState);

  const { data: user } = useRoomKickedList(roomId);
  const { data: users } = useUsers();

  const { handleUnkickUser } = useUnkickUser();

  if (!roomId) return null;

  return (
    <Dialog open={showKickedModal} onOpenChange={setShowKickedModal}>
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
                    onClick={() => handleUnkickUser(user.name, user.id)}
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
