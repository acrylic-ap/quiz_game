import { useAuth } from "@/hooks/queries/common/account/useAuth";
import { useRoomUsers } from "@/hooks/queries/room/queries/useRoomUsers";
import { RoomInfo } from "./RoomInfo";
import { UserList } from "./UserList";
import { ChatSection } from "./ChatSection";
import { useGameActions } from "@/hooks/queries/room/actions/useGameActions";
import { GameControls } from "./GameControls";
import { useAtomValue } from "jotai";
import { currentRoomIdAtom } from "@/atoms/roomAtom";

export const Section = () => {
  const roomId = useAtomValue(currentRoomIdAtom);

  const { data: users = [] } = useRoomUsers(roomId);
  const { data: user } = useAuth();
  const { toggleReady, startGame } = useGameActions(roomId, user?.uid);

  const currentUser = users.find((u) => u.id === user?.uid);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] p-6 md:p-8 flex flex-col gap-6 bg-zinc-950 text-zinc-100">
      <RoomInfo />

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        <UserList />
        <ChatSection />
      </div>

      <div
        className="h-20 flex flex-row items-center
      justify-center"
      >
        <div className="flex gap-3">
          {currentUser && (
            <GameControls
              isOwner={currentUser.isOwner}
              isReady={currentUser.isReady}
              onStart={() => startGame(users)}
              onToggleReady={() => toggleReady(currentUser.isReady)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
