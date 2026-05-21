import {
  alertModalState,
  preventClickState,
  setRoomModalState,
} from "@/app/atoms/modalAtom";
import { useAuth } from "@/app/hooks/queries/common/account/useAuth";
import { useRoomList } from "@/app/hooks/queries/lobby/useLobbyQuery";
import { useRoomNavigation } from "@/app/hooks/queries/room/actions/useRoomNavigation";
import { LobbyRoom } from "@/app/types/common/lobby/room";
import RoomCodeModal from "@/app/components/modals/RoomCodeModal";
import { useSetAtom } from "jotai";

export const Section = () => {
  const setRoomDescription = useSetAtom(setRoomModalState);
  const setAlertModal = useSetAtom(alertModalState);
  const setPreventClick = useSetAtom(preventClickState);
  const { data: user } = useAuth();

  const { data: roomList = [], isPending } = useRoomList();
  const { handleEnterRoom } = useRoomNavigation(user, setAlertModal);

  const enterRoom = (room: LobbyRoom) => {
    setPreventClick(true);
    handleEnterRoom(room);
  };

  const handleCreateRoom = () => {
    if (!user) {
      setAlertModal("로그인 후 이용해주세요!");
      return;
    }
    setRoomDescription("create");
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
          onClick={handleCreateRoom}
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
        {isPending ? (
          <div className="col-span-3 text-left">
            <p className="text-zinc-500 text-lg">방을 불러오는 중...</p>
          </div>
        ) : roomList.length === 0 ? (
          <div className="col-span-3 text-left">
            <p className="text-zinc-500 text-lg">생성된 방이 없습니다.</p>
          </div>
        ) : (
          roomList.map((room) => (
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
              <h2 className="w-full text-xl font-bold truncate">
                {room.roomName}
              </h2>
              <p className="w-full text text-zinc-300 truncate">
                {room.topicName}
              </p>
              <div
                className="absolute left-2 bottom-2
                        text mb-1 px-3 py-1
                        text-zinc-400
                        flex items-center justify-center
                        rounded-full"
              >
                {room.internalValue == 60
                  ? "전체"
                  : `${room.internalValue}문제`}
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
        )}
      </div>
    </div>
  );
};
