import { showKickedModalState } from "@/app/atoms/modalAtom";
import { currentRoomIdAtom } from "@/app/atoms/roomAtom";
import { useAuth } from "@/app/hooks/queries/common/account/useAuth";
import { useRoomSubscription } from "@/app/hooks/queries/room/queries/useRoomQuery";
import { useRoomUsers } from "@/app/hooks/queries/room/queries/useRoomUsers";
import { useKicking } from "@/app/hooks/queries/room/session/useKicking";
import { useAtom, useAtomValue } from "jotai";
import { Ban, X } from "lucide-react";

export const UserList = () => {
  const roomId = useAtomValue(currentRoomIdAtom);

  const { data: roomData } = useRoomSubscription(roomId);
  const [, setShowKickedModal] = useAtom(showKickedModalState);

  const { data: users = [] } = useRoomUsers(roomId);

  const { data: me } = useAuth();

  const { openKickModal } = useKicking(roomId);

  const isOwner = users.find((u) => u.id === me?.uid)?.isOwner;

  return (
    <div
      className="flex-1 min-w-[300px] bg-zinc-900
          rounded-lg border border-zinc-800 p-4
          flex flex-col gap-4 shadow-xl"
    >
      <div className="flex items-center justify-between">
        <h2
          className="flex items-center gap-2
          text-lg text-zinc-300 font-semibold"
        >
          참여자
          <span className="text-zinc-400">
            {users?.length}/{roomData?.maxCapacity}
          </span>
        </h2>

        {/* 강제 퇴장된 유저 리스트 확인 버튼 */}
        {isOwner && (
          <Ban
            size="18"
            color="gray"
            onClick={() => setShowKickedModal(true)}
          />
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 no-scrollbar">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between
            bg-zinc-800 p-3.5 rounded-lg border border-zinc-700/50
            hover:border-zinc-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{user.avatar}</div>
              <div>
                <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                  {user.nickname}
                  {user.isOwner && <span className="text-xs">👑</span>}
                </div>
              </div>
              {/* 방장인 경우 강제 퇴장 버튼 */}
              {isOwner && !user.isOwner && (
                <button
                  className="text-red-500 hover:text-red-400 transition"
                  onClick={() => openKickModal(user.id!, user.nickname)}
                >
                  <X size={18} />
                </button>
              )}
            </div>
            {/* 상태 표시 */}
            {!user.isOwner && (
              <div
                className={`text-sm px-3 py-1 rounded-lg
                ${
                  user.isReady
                    ? "bg-indigo-950 text-indigo-300"
                    : "bg-zinc-700 text-zinc-400"
                }`}
              >
                {user.isReady ? "준비" : "대기"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
