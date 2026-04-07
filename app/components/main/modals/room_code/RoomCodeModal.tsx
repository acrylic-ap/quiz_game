"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAtom } from "jotai";
import { alertModalState } from "@/app/atom/modalAtom";
import { Room } from "@/app/atom/lobbyAtom";
import { useRouter } from "next/navigation";

export default function RoomCodeModal() {
  const router = useRouter();
  const [, setAlertModal] = useAtom(alertModalState);
  const [roomCode, setRoomCode] = useState("");

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value);
  };

  const enterCodeRoom = () => {
    if (!roomCode) return setAlertModal("코드를 입력해주세요!");

    // 1. 컬렉션 참조 생성
    const roomsCollection = collection(db, "rooms");

    // 2. 데이터 가져오기
    getDocs(roomsCollection).then((querySnapshot) => {
      const roomsData: Room[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        roomName: doc.data().roomName,
        topic: doc.data().topic,
        capacity: doc.data().capacity,
        maxCapacity: doc.data().maxCapacity,
        playing: doc.data().playing,
      }));
      const room = roomsData.find((room) => room.id === roomCode);

      if (!room) {
        setAlertModal("존재하지 않는 코드입니다!");
        return;
      } else if (room.playing) {
        setAlertModal("이미 진행 중인 방입니다!");
        return;
      } else if (room.capacity === room.maxCapacity) {
        setAlertModal("인원이 꽉 찼습니다!");
        return;
      }

      router.push(`/room/${roomCode}`);
    });
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
              rounded-lg pl-3 py-3
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
