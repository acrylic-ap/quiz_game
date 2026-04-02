"use client";

import { useAtom } from "jotai";
import { roomListState } from "@/app/atom/lobbyAtom";
import RoomModal from "./components/main/modals/room/RoomModal";
import RoomCodeModal from "./components/main/modals/room_code/RoomCodeModal";
import { alertModalState } from "./atom/modalAtom";

export const Header = () => {
  return (
    <div
      className="relative w-full h-[20%]
                flex items-center justify-center"
    >
      {/* <div className="absolute top-0 left-0">로그인</div> */}

      <h1 className="text-5xl font-bold">스피드 퀴즈</h1>
    </div>
  );
};

export const Section = () => {
  const [roomList] = useAtom(roomListState);
  const [, setShowAlertModal] = useAtom(alertModalState);

  const enterRoom = (
    id: string,
    capacity: number,
    maxCapacity: number,
    played: boolean,
  ) => {
    if (played) {
      setShowAlertModal("이미 진행 중인 방입니다!");
      return;
    }

    if (capacity === maxCapacity) {
      setShowAlertModal("인원이 꽉 찼습니다!");
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
        {roomList.length ? (
          roomList.map((room) => (
            <div
              role="button"
              onClick={() =>
                enterRoom(room.id, room.capacity, room.maxCapacity, room.played)
              }
              className={`relative h-[180px]
                      flex justify-center flex-col
                      rounded-lg
                      ${room.played ? "bg-zinc-950" : "bg-zinc-900 hover:bg-zinc-800"}`}
              key={room.id}
            >
              <h2 className="w-full text-2xl font-bold px-4">
                {room.roomName}
              </h2>
              <p className="w-full text text-zinc-300 px-4">{room.topic}</p>
              <div
                className={`absolute right-3 bottom-2
                        text ml-5 px-3 py-1
                        flex items-center justify-center
                        rounded-full
                        ${room.capacity === room.maxCapacity ? "text-red-500 bg-red-900/20" : "text-white bg-zinc-500/20"}`}
              >
                {room.capacity} / {room.maxCapacity}
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-full">
            <p className="text-zinc-500 text-lg">생성된 방이 없습니다.</p>
          </div>
        )}
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
