import { useAuth } from "@/hooks/queries/common/account/useAuth";
import { useRoomKicked } from "@/hooks/queries/room/session/useRoomKicked";
import { useRoomSubscription } from "@/hooks/queries/room/queries/useRoomQuery";
import { useRoomUsers } from "@/hooks/queries/room/queries/useRoomUsers";
import { SquareArrowRightExit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRoomExitActions } from "@/hooks/queries/room/session/useRoomExitActions";
import { currentRoomIdAtom } from "@/atoms/roomAtom";
import { useAtomValue } from "jotai";

export const Header = () => {
  const roomId = useAtomValue(currentRoomIdAtom);

  const router = useRouter();

  const { data: roomData } = useRoomSubscription(roomId);
  const { data: users = [] } = useRoomUsers(roomId);
  const { data: user } = useAuth();

  // 로직을 전담하는 훅 호출
  const { confirmAndExit } = useRoomExitActions(roomId, user?.uid);

  useRoomKicked(roomId, user?.uid);

  const handleExit = () => {
    const currentUser = users.find((u) => u.id === user?.uid);
    if (!currentUser) return;

    confirmAndExit(currentUser.isOwner, () => router.replace("/"));
  };

  return (
    <header
      className="sticky top-0 z-50 w-full h-20
    bg-zinc-950/80 backdrop-blur-sm border-b
    border-zinc-800 flex items-center justify-between
    px-6 shadow-lg shadow-black/20"
    >
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-indigo-400">{roomId}</span> {roomData?.roomName}
        </h1>
      </div>

      <button
        className="rounded-xl
            text-lg font-semibold transition active:scale-95"
        onClick={handleExit}
      >
        <SquareArrowRightExit
          size={25}
          className="text-white hover:text-red-500"
        />
      </button>
    </header>
  );
};
