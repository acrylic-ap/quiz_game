import { alertModalState, setRoomModalState } from "@/atoms/modalAtom";
import { currentRoomIdAtom } from "@/atoms/roomAtom";
import { useAuth } from "@/hooks/queries/common/account/useAuth";
import { useRoomSubscription } from "@/hooks/queries/room/queries/useRoomQuery";
import { useRoomUsers } from "@/hooks/queries/room/queries/useRoomUsers";
import { getDisplayTopic } from "@/utils/getDisplayTopic";
import {
  TOPIC_DECISION_LIST,
  TopicDecisionType,
} from "@/types/common/room/topic";
import { useAtom, useAtomValue } from "jotai";
import { Eye, EyeClosed, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const RoomInfo = () => {
  const roomId = useAtomValue(currentRoomIdAtom);

  const router = useRouter();

  const [, setRoomDescription] = useAtom(setRoomModalState);
  const [, setAlertModal] = useAtom(alertModalState);

  const { data: roomData } = useRoomSubscription(roomId);
  const { data: user } = useAuth();

  // 로그인이 안 돼 있는 경우 퇴실
  useEffect(() => {
    if (!user) {
      setAlertModal("정상적인 접근이 아닙니다.");
      router.replace("/");
    }
  }, [user]);

  const decisionLabel =
    TOPIC_DECISION_LIST[roomData?.gameConfig.decision as TopicDecisionType]
      ?.label ?? "랜덤";

  const questionCountLabel =
    roomData?.gameConfig.lastRound === 60
      ? "모든"
      : roomData?.gameConfig.lastRound;

  return (
    <div
      className="h-20 flex flex-row items-center
    justify-between bg-zinc-900 rounded
    border border-zinc-800 px-6 shadow-xl"
    >
      <div className="text-zinc-400 flex items-center gap-3">
        {true ? <Eye size={20} /> : <EyeClosed size={20} />}
        <span className="text-xl font-bold text-zinc-100">주제</span>
        <label className="text-lg">
          {roomData?.gameConfig.topic &&
            getDisplayTopic(roomData?.gameConfig.topic)}
          {`[${questionCountLabel}문제, ${decisionLabel}]`}
        </label>
      </div>

      <div className="h-fit flex">
        {user?.uid === roomData?.config.ownerId && (
          <button onClick={() => setRoomDescription("edit")}>
            <Settings
              size={22}
              className="text-zinc-400 hover:text-zinc-100 transition"
            />
          </button>
        )}
      </div>
    </div>
  );
};
