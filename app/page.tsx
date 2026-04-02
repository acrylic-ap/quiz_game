"use client";

import { useAtom } from "jotai";
import { roomListState } from "@/app/atom/lobbyAtom";
import RoomModal from "./components/modals/room_modal/RoomModal";
import RoomCodeModal from "./components/modals/room_code_modal/RoomCodeModal";

export const Header = () => {
  return (
    <div
      className="relative w-full h-[20%]
                flex items-center justify-center"
    >
      <h1 className="text-5xl font-bold">스피드 퀴즈</h1>
    </div>
  );
};

export const Section = () => {
  const [roomList] = useAtom(roomListState);

  const enterRoom = (
    id: string,
    capacity: number,
    maxCapacity: number,
    played: boolean,
  ) => {
    if (played) {
      alert("이미 진행 중인 방입니다!");
      return;
    }

    if (capacity === maxCapacity) {
      alert("인원이 꽉 찼습니다!");
      return;
    }
  };

  return (
    <div
      className="w-full h-[85%]
                flex flex-col items-center"
    >
      <div
        className="w-[95%] mb-3
                  flex justify-end"
      >
        <RoomModal />
        <RoomCodeModal />
      </div>

      <div
        id="room-container"
        className="grid grid-cols-3 gap-3 content-start
                  w-[95%] h-auto select-none"
      >
        {roomList.map((room) => (
          <div
            role="button"
            onClick={() =>
              enterRoom(room.id, room.capacity, room.maxCapacity, room.played)
            }
            className={`relative h-[150px]
                      flex justify-center flex-col
                      rounded-lg
                      ${room.played ? "bg-zinc-950" : "bg-zinc-900 hover:bg-zinc-800"}`}
            key={room.id}
          >
            <h2 className="text-2xl font-bold ml-5">{room.roomName}</h2>
            <p className="text ml-5">| {room.topic}</p>
            <div
              className={`absolute right-3 bottom-2
                        text ml-5 px-3 py-1 rounded-2xl
                        flex items-center justify-center
                        ${room.capacity === room.maxCapacity ? "bg-red-900" : "bg-stone-700"}`}
            >
              {room.capacity} | {room.maxCapacity}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div
      className="w-full h-full
                flex flex-col
                font-[Pretendard]"
    >
      <Header />
      <Section />
    </div>
  );
}
