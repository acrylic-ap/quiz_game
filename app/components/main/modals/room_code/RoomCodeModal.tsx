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
import { alertModalState, preventClickState } from "@/app/atom/modalAtom";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/hooks/queries/lobby/useAuth";
import { useRoomList } from "@/app/hooks/queries/lobby/useLobbyQuery";
import { useRoomNavigation } from "@/app/hooks/queries/room/useRoomNavigation";
import { useRoomUsers } from "@/app/hooks/queries/room/useRoomUsers";

export default function RoomCodeModal() {
  const router = useRouter();
  const [, setAlertModal] = useAtom(alertModalState);
  const [, setPreventClick] = useAtom(preventClickState);
  const [roomCode, setRoomCode] = useState("");

  const { data: user } = useUser();
  const { data: roomList = [] } = useRoomList();
  const { handleEnterRoom } = useRoomNavigation(user, setAlertModal);

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value);
  };

  const enterCodeRoom = () => {
    if (!roomCode) return setAlertModal("코드를 입력해주세요!");

    const room = roomList.find((room) => room.id === roomCode);

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
            onKeyDown={(e) => {
              if (e.key === "Enter") enterCodeRoom();
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
