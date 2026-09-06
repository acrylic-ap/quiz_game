import { showKickedModalState } from "@/atoms/modalAtom";
import { currentRoomIdAtom } from "@/atoms/roomAtom";
import { useAuth } from "@/hooks/queries/common/account/useAuth";
import { useRoomSubscription } from "@/hooks/queries/room/crud/useRoomQuery";
import { useRoomUsers } from "@/hooks/queries/room/crud/useRoomUsers";
import { useKicking } from "@/hooks/queries/room/session/useKicking";
import { useAtom, useAtomValue } from "jotai";
import { Ban, X } from "lucide-react";

export const UserList = () => {
  const roomId = useAtomValue(currentRoomIdAtom);

  const { data: roomData } = useRoomSubscription(roomId);
  const [, setShowKickedModal] = useAtom(showKickedModalState);

  const { data: users = [] } = useRoomUsers(roomId);

  const { data: me } = useAuth();

  const { openKickModal } = useKicking(roomId);

  const ownerId = roomData?.config.ownerId;
  const isOwner = me?.uid === ownerId;

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
            {users.length}/{roomData?.config.maxCapacity}
          </span>
        </h2>

        {isOwner && (
          <Ban
            size="18"
            color="gray"
            onClick={() => setShowKickedModal(true)}
          />
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 no-scrollbar">
        {users.map((user) => {
          const userIsOwner = user.id === ownerId;

          return (
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
                    {userIsOwner && <span className="text-xs">👑</span>}
                  </div>
                </div>

                {isOwner && !userIsOwner && (
                  <button
                    className="text-red-500 hover:text-red-400 transition"
                    onClick={() => openKickModal(user.id, user.nickname)}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {!userIsOwner && (
                <div
                  className={`text-sm px-3 py-1 rounded-lg ${
                    user.isReady
                      ? "bg-indigo-950 text-indigo-300"
                      : "bg-zinc-700 text-zinc-400"
                  }`}
                >
                  {user.isReady ? "준비" : "대기"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
