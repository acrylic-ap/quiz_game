"use client";

import { useAtom } from "jotai";
import { LobbyRoom } from "@/app/atom/lobbyAtom";
import RoomCodeModal from "./components/main/modals/room_code/RoomCodeModal";
import {
  alertModalState,
  loginModalState,
  setRoomModalState,
} from "./atom/modalAtom";
import { useUser } from "./hooks/queries/lobby/useAuth";
import { useRoomList } from "./hooks/queries/lobby/useLobbyQuery";
import { useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import UserInfoModal from "./components/main/modals/user_info/UserInfoModal";
import { useRoomNavigation } from "./hooks/queries/room/useRoomNavigation";

export const Header = () => {
  const [, setShowLoginModal] = useAtom(loginModalState);
  const [, setAlertModal] = useAtom(alertModalState);
  const [infoDropdown, setInfoDropdown] = useState(false);

  const { data: user, isLoading } = useUser();

  const handleLogout = async () => {
    const auth = getAuth();

    try {
      await signOut(auth);
      console.log("로그아웃 성공");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  const ALL_DROPDOWN_ITEMS = [
    { label: "전적", link: "/rank", adminOnly: false },
    { label: "퀴즈 관리", link: "/quiz", adminOnly: false },
    { label: "사용자 관리", link: "/admin/users", adminOnly: true }, // 관리자 전용 예시
    { label: "로그아웃", onClick: handleLogout, adminOnly: false },
  ];

  const dropdownItems = ALL_DROPDOWN_ITEMS.filter((item) => !item.adminOnly);

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
          {isLoading ? (
            <span>...</span>
          ) : (
            <button
              onClick={() =>
                !user ? setShowLoginModal(true) : setInfoDropdown(!infoDropdown)
              }
            >
              {user ? user.nickname : "로그인"}
            </button>
          )}
          {user && infoDropdown && (
            <div
              className="absolute w-30 mt-2 pt-2 px-2 right-0
              bg-zinc-800 rounded
              text-center text-zinc-100"
            >
              <UserInfoModal user={user} />
              {dropdownItems.map((item) => (
                <p
                  className="hover:bg-zinc-700 mb-2"
                  key={item.label}
                  onClick={
                    item.onClick
                      ? item.onClick
                      : () => setAlertModal("추후에 출시됩니다.")
                  }
                >
                  {item.label}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Section = () => {
  const [, setRoomDescription] = useAtom(setRoomModalState);
  const [, setAlertModal] = useAtom(alertModalState);
  const { data: user } = useUser();

  const { data: roomList = [], isPending } = useRoomList();
  const { handleEnterRoom } = useRoomNavigation(user, setAlertModal);

  const enterRoom = (room: LobbyRoom) => {
    handleEnterRoom(room);
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
          onClick={() =>
            !user
              ? setAlertModal("로그인 후 이용해주세요!")
              : setRoomDescription("create")
          }
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
        {roomList.map((room) => (
          <div
            role="button"
            onClick={() => enterRoom(room)}
            className={`relative h-[150px]
                      flex flex-col
                      p-5
                      rounded-lg
                      ${room.playing ? "bg-zinc-950" : "bg-zinc-900 hover:bg-zinc-800"}`}
            key={room.id}
          >
            <h2 className="w-full text-xl font-bold">{room.roomName}</h2>
            <p className="w-full text text-zinc-300">{room.topicName}</p>
            <div
              className="absolute left-2 bottom-2
                        text mb-1 px-3 py-1
                        text-zinc-400
                        flex items-center justify-center
                        rounded-full"
            >
              {room.internalValue == 60 ? "전체" : `${room.internalValue}문제`}
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
        ))}
        {!isPending ? (
          !roomList.length && (
            <div className="w-full h-full">
              <p className="text-zinc-500 text-lg">생성된 방이 없습니다.</p>
            </div>
          )
        ) : (
          <div className="w-full h-full">
            <p className="text-zinc-500 text-lg">방을 불러오는 중...</p>
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
