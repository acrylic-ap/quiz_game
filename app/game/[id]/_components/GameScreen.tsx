import { GameHeader } from "./GameHeader";
import { GameStartWatcher } from "./GameStartWatcher";
import { GameTopicRandomPanel } from "./GameTopicRandomPanel";
import { GameTopicVotePanel } from "./GameTopicVotePanel";
import { useGameTopicVoteTimer } from "@/hooks/queries/game/crud/useGameTopicVoteTimer";
import { useGameSubscription } from "@/hooks/queries/game/session/useGameSubscription";
import { GamePlay } from "./GamePlay";

interface GameUser {
  id: string;
  nickname: string;
}

interface GameScreenProps {
  roomId: string;
  title: string;
  allUsersReady: boolean;
  isOwner: boolean;
  userId: string | undefined;
  users: GameUser[];
  decision: "random" | "vote" | "always_random";
  lastRound: number;
  topicIds: string[];
  topicNames: Record<string, string>;
  topicDescriptions: Record<string, string>;
  topicCategories: Record<string, string>;
}

export const GameScreen = ({
  roomId,
  title,
  allUsersReady,
  isOwner,
  userId,
  users,
  decision,
  lastRound,
  topicIds,
  topicNames,
  topicDescriptions,
  topicCategories,
}: GameScreenProps) => {
  const { startedAt: topicVoteStartedAt, serverTimeOffset } =
    useGameTopicVoteTimer(roomId);
  const { data: game } = useGameSubscription(roomId);

  return (
    <section className="flex h-full w-full flex-col">
      <GameHeader roomId={roomId} title={title} />

      <div className="flex min-h-0 flex-1">
        {!allUsersReady ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-2xl text-zinc-400">
              플레이어 입장을 기다리는 중...
            </div>
          </div>
        ) : game?.status === "playing" ? (
          <GamePlay
            roomId={roomId}
            userId={userId}
            isOwner={isOwner}
            users={users}
            game={game}
            serverTimeOffset={serverTimeOffset}
          />
        ) : (
          <>
            {decision === "random" ? (
              <GameTopicRandomPanel
                roomId={roomId}
                isOwner={isOwner}
                topicIds={topicIds}
                topicNames={topicNames}
                topicDescriptions={topicDescriptions}
                topicCategories={topicCategories}
                decision={decision}
              />
            ) : (
              <GameTopicVotePanel
                roomId={roomId}
                userId={userId}
                users={users}
                topicIds={topicIds}
                topicNames={topicNames}
                topicDescriptions={topicDescriptions}
                topicCategories={topicCategories}
                decision={decision}
                topicVoteStartedAt={topicVoteStartedAt}
                serverTimeOffset={serverTimeOffset}
              />
            )}
            <GameStartWatcher
              roomId={roomId}
              isOwner={isOwner}
              decision={decision}
              lastRound={lastRound}
              topicIds={topicIds}
              users={users}
              topicVoteStartedAt={topicVoteStartedAt}
              serverTimeOffset={serverTimeOffset}
            />
          </>
        )}
      </div>
    </section>
  );
};
