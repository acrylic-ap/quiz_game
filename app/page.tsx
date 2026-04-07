"use client";

import { useAtom } from "jotai";
import { roomListState } from "@/app/atom/lobbyAtom";
import RoomCodeModal from "./components/main/modals/room_code/RoomCodeModal";
import { alertModalState, setRoomModalState } from "./atom/modalAtom";

export const Header = () => {
  return (
    <div
      className="relative w-full h-[20%]
                flex justify-center items-center"
    >
      <div className="relative w-[75%] h-full">
        <h1 className="absolute left-0 top-[35px] text-4xl font-bold">
          스피드 퀴즈
        </h1>

        <div className="absolute right-0 top-[35px]">
          <button>로그인</button>
        </div>
      </div>
    </div>
  );
};

export const Section = () => {
  const [, setRoomDescription] = useAtom(setRoomModalState);
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
        className="w-[75%] mb-3
                  flex justify-end"
      >
        <button
          className="px-8 py-3 mr-2 rounded-sm
                  text-xl select-none bg-zinc-900
                  hover:bg-zinc-800"
          onClick={() => setRoomDescription("create")}
        >
          방 생성
        </button>

        <RoomCodeModal />
      </div>

      <div
        id="room-container"
        className="grid grid-cols-3 gap-5 content-start
                  w-[75%] h-auto select-none"
      >
        {roomList.length ? (
          roomList.map((room) => (
            <div
              role="button"
              onClick={() =>
                enterRoom(room.id, room.capacity, room.maxCapacity, room.played)
              }
              className={`relative h-[150px]
                      flex flex-col
                      p-5
                      rounded-lg
                      ${room.played ? "bg-zinc-950" : "bg-zinc-900 hover:bg-zinc-800"}`}
              key={room.id}
            >
              <h2 className="w-full text-xl font-bold">{room.roomName}</h2>
              <p className="w-full text text-zinc-300">{room.topic}</p>
              <div
                className="absolute left-2 bottom-2
                        text mb-1 px-3 py-1
                        text-zinc-400
                        flex items-center justify-center
                        rounded-full"
              >
                10문제
              </div>
              <div
                className={`absolute right-3 bottom-2
                        text ml-5 mb-1 px-3 py-1
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
