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
import { alertModalState, preventClickState } from "@/app/atoms/modalAtom";
import { useAuth } from "@/app/hooks/queries/common/account/useAuth";
import { useRoomList } from "@/app/hooks/queries/lobby/useLobbyQuery";
import { useRoomNavigation } from "@/app/hooks/queries/room/actions/useRoomNavigation";

export default function RoomCodeModal() {
  const [, setAlertModal] = useAtom(alertModalState);
  const [, setPreventClick] = useAtom(preventClickState);
  const [roomCode, setRoomCode] = useState("");

  const { data: user } = useAuth();
  const { data: roomList = [] } = useRoomList();
  const { handleEnterRoom } = useRoomNavigation(user, setAlertModal);

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value);
  };

  const enterCodeRoom = () => {
    const cleanRoomCode = roomCode.replace(/\s/g, "");

    if (!roomCode) {
      return setAlertModal("코드를 입력해주세요!");
    }

    const room = roomList.find((room) => room.id === cleanRoomCode);

    if (room) {
      setPreventClick(true);
      handleEnterRoom(room);
    } else {
      setAlertModal("유효하지 않은 방 코드입니다!");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="px-8 py-3 rounded-sm
                  text-xl select-none bg-zinc-900
                  hover:bg-zinc-800"
        >
          코드 입력
        </button>
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
