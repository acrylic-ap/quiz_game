"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useAtom } from "jotai";
import { alertModalState, preventClickState } from "@/atoms/modalAtom";
import { useAuth } from "@/hooks/queries/common/account/useAuth";
import { useRoomList } from "@/hooks/queries/lobby/useLobbyQuery";
import { useRoomNavigation } from "@/hooks/queries/room/actions/useRoomNavigation";
import { Button } from "@/components/ui/button";
import { get, ref } from "firebase/database";
import { rtdb } from "@/lib/firebase";

export default function RoomCodeModal() {
  const [, setAlertModal] = useAtom(alertModalState);
  const [, setPreventClick] = useAtom(preventClickState);
  const [roomCode, setRoomCode] = useState("");

  const { data: user } = useAuth();
  const { handleEnterRoom } = useRoomNavigation(user, setAlertModal);

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value);
  };

  const enterCodeRoom = async () => {
    const cleanRoomCode = roomCode.replace(/\s/g, "");

    if (!cleanRoomCode) {
      return setAlertModal("코드를 입력해주세요!");
    }

    try {
      const roomRef = ref(rtdb, `room_sessions/${cleanRoomCode}`);

      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        return setAlertModal("유효하지 않은 방 코드입니다!");
      }

      const roomData = snapshot.val();

      setPreventClick(true);

      handleEnterRoom({
        id: cleanRoomCode,
        ...roomData,
      });
    } catch (error) {
      console.error("방 코드 조회 에러:", error);
      setAlertModal("방을 확인하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="xl" className="px-8 py-3">
          코드 입력
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-zinc-950 text-zinc-100 select-none">
        <DialogHeader className="flex items-center">
          <DialogTitle className="text-xl flex items-center font-semibold">
            코드 입력
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col py-3">
          <input
            type="text"
            id="room-name"
            placeholder="방 코드를 입력하세요"
            className="bg-zinc-900 text-zinc-100
              rounded-lg pl-4 py-3
              outline-none
              placeholder:text-zinc-500"
            value={roomCode}
            onChange={handleRoomCodeChange}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                enterCodeRoom();
              }
            }}
          />
        </div>

        <div className="flex justify-center">
          <button
            className="w-30 px-6 py-2 rounded
              text-lg outline-none"
            onClick={enterCodeRoom}
          >
            입장
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
