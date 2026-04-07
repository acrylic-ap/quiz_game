"use client";

import { showTopicModalState } from "@/app/atom/modalAtom";
import { topicListState } from "@/app/atom/topicAtom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function RoomCodeModal() {
  const [roomName, setRoomName] = useState("");

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
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
            placeholder="비번방 코드를 입력하세요"
            className="bg-zinc-900 text-zinc-100
              rounded-lg pl-3 py-3
              outline-none
              placeholder:text-zinc-500"
            value={roomName}
            onChange={handleRoomNameChange}
          />
        </div>

        <div className="flex justify-center">
          <button
            className="w-30 px-6 py-2 rounded
              text-lg outline-none"
          >
            입장
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
