"use client";

import { useGamePlayActions } from "@/hooks/queries/game/actions/useGamePlayActions";

import { FinalView } from "./game_play/FinalView";
import { QuestionView } from "./game_play/QuestionView";
import { RankingPopup } from "./game_play/RankingPopup";
import { RankingView } from "./game_play/RankingView";
import { ResultView } from "./game_play/ResultView";
import { GamePlayProps } from "./game_play/types";
import { GameRoundHostWatcher } from "./GameRoundHostWatcher";

export const GamePlay = ({
  roomId,
  userId,
  isOwner,
  users,
  game,
  serverTimeOffset,
}: GamePlayProps) => {
  const { returnToRoom } = useGamePlayActions(roomId, userId);

  const question = game.questionList[game.currentRound];

  if (!userId || !question) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-400">
        게임 데이터를 불러오는 중...
      </div>
    );
  }

  const showRankingPopup = game.phase === "question" || game.phase === "result";

  return (
    <div className="relative flex min-h-0 flex-1">
      <GameRoundHostWatcher
        roomId={roomId}
        isOwner={isOwner}
        users={users}
        game={game}
        serverTimeOffset={serverTimeOffset}
      />

      {!game.phase && (
        <div className="flex flex-1 items-center justify-center text-zinc-400">
          첫 문제를 준비하는 중...
        </div>
      )}

      {game.phase === "question" && (
        <QuestionView
          key={game.currentRound}
          roomId={roomId}
          userId={userId}
          users={users}
          game={game}
          question={question}
        />
      )}

      {game.phase === "result" && (
        <ResultView
          roomId={roomId}
          userId={userId}
          game={game}
          question={question}
          serverTimeOffset={serverTimeOffset}
        />
      )}

      {game.phase === "ranking" && (
        <RankingView
          roomId={roomId}
          userId={userId}
          users={users}
          game={game}
          serverTimeOffset={serverTimeOffset}
        />
      )}

      {game.phase === "final" && (
        <FinalView
          roomId={roomId}
          userId={userId}
          isOwner={isOwner}
          users={users}
          game={game}
          returnToRoom={returnToRoom}
        />
      )}

      {showRankingPopup && (
        <div
          className="
            absolute right-6 top-1/2 z-30
            -translate-y-1/2
          "
        >
          <RankingPopup userId={userId} users={users} game={game} />
        </div>
      )}
    </div>
  );
};
