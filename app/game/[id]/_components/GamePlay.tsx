"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useGamePlayActions } from "@/hooks/queries/game/actions/useGamePlayActions";
import { useRoomExit } from "@/hooks/queries/room/session/useRoomExit";
import { Game } from "@/types/game/game";
import { Question } from "@/types/topic/topic";
import {
  PHASE_TRANSITION_MS,
  getRankedEntries,
  isSubmissionComplete,
} from "@/utils/game";
import { GameRoundHostWatcher } from "./GameRoundHostWatcher";

interface GameUser {
  id: string;
  nickname: string;
}

interface GamePlayProps {
  roomId: string;
  userId: string | undefined;
  isOwner: boolean;
  users: GameUser[];
  game: Game;
  serverTimeOffset: number;
}

const useRemainingSeconds = (
  deadlineAt: number | undefined,
  serverTimeOffset = 0,
) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadlineAt) {
      return;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 200);

    return () => window.clearInterval(interval);
  }, [deadlineAt]);

  if (!deadlineAt) {
    return null;
  }

  return Math.max(
    0,
    Math.ceil((deadlineAt - (now + serverTimeOffset)) / 1_000),
  );
};

const WaitingView = ({
  users,
  game,
  deadlineAt,
}: {
  users: GameUser[];
  game: Game;
  deadlineAt: number;
}) => {
  const remainingSeconds = useRemainingSeconds(deadlineAt);
  const submissions = game.round?.submissions ?? {};

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <p className="text-2xl font-semibold text-zinc-100">
        다른 플레이어를 기다리는 중
      </p>
      <p className="text-lg text-zinc-400">남은 시간 {remainingSeconds}초</p>

      <div className="flex gap-4">
        {users.map((user) => {
          const complete = isSubmissionComplete(submissions[user.id]);

          return (
            <div key={user.id} className="flex flex-col items-center gap-2">
              <svg width="24" height="30" viewBox="0 0 18 22" aria-hidden="true">
                <circle
                  cx="9"
                  cy="5.5"
                  r="5.5"
                  fill={complete ? "#D4D4D8" : "#3F3F46"}
                />
                <path
                  d="M0 21.0287C0 7.31719 18 8.07896 18 21.0287L0 21.0287Z"
                  fill={complete ? "#D4D4D8" : "#3F3F46"}
                />
              </svg>
              <span className="max-w-24 truncate text-xs text-zinc-500">
                {user.nickname}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const QuestionView = ({
  roomId,
  userId,
  users,
  game,
  question,
}: {
  roomId: string;
  userId: string;
  users: GameUser[];
  game: Game;
  question: Question;
}) => {
  const { startQuestion, submitAnswer, submitTimeout } = useGamePlayActions(
    roomId,
    userId,
  );
  const [answer, setAnswer] = useState("");
  const player = game.round?.players?.[userId];
  const submission = game.round?.submissions?.[userId];
  const remainingSeconds = useRemainingSeconds(player?.deadlineAt);

  useEffect(() => {
    if (!player) {
      void startQuestion();
    }
  }, [player, startQuestion]);

  useEffect(() => {
    if (!player || submission) {
      return;
    }

    const remainingTime = Math.max(0, player.deadlineAt - Date.now());
    const timer = window.setTimeout(() => {
      void submitTimeout(player);
    }, remainingTime);

    return () => window.clearTimeout(timer);
  }, [player, submission, submitTimeout]);

  if (!player) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-400">
        문제를 준비하는 중...
      </div>
    );
  }

  if (submission) {
    return (
      <WaitingView users={users} game={game} deadlineAt={player.deadlineAt} />
    );
  }

  const isChoice =
    question.answerType === "single" ||
    question.questionType === "choice" ||
    (question.options?.length ?? 0) > 0;
  const canSubmit = answer.trim().length > 0 && remainingSeconds !== 0;

  return (
    <div className="flex flex-1 flex-col px-12 py-10">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">
          문제 {game.currentRound + 1} / {game.questionList.length}
        </span>
        <span className="text-xl font-semibold text-zinc-200">
          {remainingSeconds}초
        </span>
      </div>

      <h2 className="mt-16 text-center text-3xl font-semibold text-zinc-100">
        {question.question}
      </h2>

      {isChoice ? (
        <div className="mx-auto mt-14 grid w-full max-w-4xl grid-cols-2 gap-4">
          {question.options?.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setAnswer(option)}
              className={`rounded-lg border p-5 text-left transition ${
                answer === option
                  ? "border-zinc-200 bg-zinc-800 text-white"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <input
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && canSubmit) {
              void submitAnswer(answer.trim(), player);
            }
          }}
          placeholder="정답을 입력하세요"
          className="mx-auto mt-14 w-full max-w-2xl rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-4 text-zinc-100 outline-none focus:border-zinc-400"
        />
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => void submitAnswer(answer.trim(), player)}
        className="mx-auto mt-10 rounded-lg bg-zinc-200 px-10 py-3 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        제출
      </button>
    </div>
  );
};

const PhaseCountdown = ({
  requestedAt,
  serverTimeOffset,
}: {
  requestedAt: number | undefined;
  serverTimeOffset: number;
}) => {
  const remainingSeconds = useRemainingSeconds(
    requestedAt ? requestedAt + PHASE_TRANSITION_MS : undefined,
    serverTimeOffset,
  );

  if (remainingSeconds === null) {
    return null;
  }

  return (
    <div className="absolute right-6 top-6 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300">
      {remainingSeconds}초 후 다음으로 넘어갑니다
    </div>
  );
};

const PhaseNextButton = ({
  hasRequested,
  onClick,
}: {
  hasRequested: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      disabled={hasRequested}
      onClick={onClick}
      className="rounded-lg bg-zinc-200 px-10 py-3 font-semibold text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-300"
    >
      다음
    </button>
  );
};

const ResultView = ({
  roomId,
  userId,
  game,
  question,
  serverTimeOffset,
}: {
  roomId: string;
  userId: string;
  game: Game;
  question: Question;
  serverTimeOffset: number;
}) => {
  const { requestResultNext } = useGamePlayActions(roomId, userId);
  const submission = game.round?.submissions?.[userId];
  const correctCount = Object.values(game.round?.submissions ?? {}).filter(
    (item) => item.isCorrect,
  ).length;
  const hasRequested = game.round?.resultNextReady?.[userId] === true;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <PhaseCountdown
        requestedAt={game.round?.resultNextRequestedAt}
        serverTimeOffset={serverTimeOffset}
      />
      <h2 className="text-3xl font-semibold text-zinc-100">
        {submission?.status === "timeout"
          ? "시간 초과"
          : submission?.isCorrect
            ? "정답입니다"
            : "오답입니다"}
      </h2>

      <div className="space-y-3 text-lg text-zinc-300">
        <p>내 답: {submission?.answer ?? "시간 초과"}</p>
        <p>정답: {question.answer ?? ""}</p>
        <p>전체 정답자: {correctCount}명</p>
        <p>현재 콤보: {submission?.combo ?? 0}</p>
        <p>풀이 시간: {((submission?.elapsedTime ?? 0) / 1_000).toFixed(2)}초</p>
      </div>

      <PhaseNextButton
        hasRequested={hasRequested}
        onClick={() => void requestResultNext()}
      />
    </div>
  );
};

const RankingView = ({
  roomId,
  userId,
  users,
  game,
  serverTimeOffset,
}: {
  roomId: string;
  userId: string;
  users: GameUser[];
  game: Game;
  serverTimeOffset: number;
}) => {
  const { requestRankingNext } = useGamePlayActions(roomId, userId);
  const nicknameMap = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user.nickname])),
    [users],
  );
  const rows = getRankedEntries(game.ranking ?? {});
  const hasRequested = game.round?.rankingNextReady?.[userId] === true;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <PhaseCountdown
        requestedAt={game.round?.rankingNextRequestedAt}
        serverTimeOffset={serverTimeOffset}
      />
      <h2 className="text-3xl font-semibold text-zinc-100">현재 순위</h2>

      <div className="w-full max-w-2xl space-y-3">
        {rows.map((row) => (
          <div
            key={row.userId}
            className={`flex items-center rounded-lg border px-5 py-4 ${
              row.rank === 1
                ? "border-zinc-300 bg-zinc-800"
                : "border-zinc-800 bg-zinc-900"
            }`}
          >
            <span className="w-16 text-xl font-semibold text-zinc-200">
              {row.rank}위
            </span>
            <span className="flex-1 text-zinc-100">
              {nicknameMap[row.userId] ?? row.userId}
            </span>
            {row.combo > 0 && (
              <span className="mr-6 text-sm text-zinc-400">
                {row.combo} combo
              </span>
            )}
            <span className="font-semibold text-zinc-200">{row.score}</span>
          </div>
        ))}
      </div>

      <PhaseNextButton
        hasRequested={hasRequested}
        onClick={() => void requestRankingNext()}
      />
    </div>
  );
};

const FinalView = ({
  roomId,
  userId,
  isOwner,
  users,
  game,
  returnToRoom,
}: {
  roomId: string;
  userId: string;
  isOwner: boolean;
  users: GameUser[];
  game: Game;
  returnToRoom: () => Promise<void>;
}) => {
  const router = useRouter();
  const { exitRoom } = useRoomExit(roomId, userId);
  const [revealStage, setRevealStage] = useState(0);
  const nicknameMap = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user.nickname])),
    [users],
  );
  const rows = getRankedEntries(game.ranking ?? {});

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setRevealStage(1), 400),
      window.setTimeout(() => setRevealStage(2), 1_300),
      window.setTimeout(() => setRevealStage(3), 2_200),
      window.setTimeout(() => setRevealStage(4), 3_100),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const revealedRanks = [3, 2, 1].slice(0, revealStage);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <h2 className="text-3xl font-semibold text-zinc-100">최종 결과</h2>

      {revealStage < 4 ? (
        <div className="min-h-52 w-full max-w-xl space-y-4">
          {revealedRanks.map((rank) => {
            const winners = rows.filter((row) => row.rank === rank);

            return winners.map((row) => (
              <div
                key={row.userId}
                className="flex items-center rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-5 transition"
              >
                <span className="w-20 text-2xl font-bold text-zinc-200">
                  {rank}위
                </span>
                <span className="flex-1 text-xl text-zinc-100">
                  {nicknameMap[row.userId] ?? row.userId}
                </span>
                <span className="text-zinc-300">{row.score}</span>
              </div>
            ));
          })}
        </div>
      ) : (
        <div className="w-full max-w-xl space-y-3">
          {rows.map((row) => (
            <div
              key={row.userId}
              className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4"
            >
              <span className="w-16 font-semibold text-zinc-200">
                {row.rank}위
              </span>
              <span className="flex-1 text-zinc-100">
                {nicknameMap[row.userId] ?? row.userId}
              </span>
              <span className="text-zinc-300">{row.score}</span>
            </div>
          ))}
        </div>
      )}

      {revealStage >= 4 && (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={async () => {
              await exitRoom(isOwner);
              router.replace("/");
            }}
            className="rounded-lg border border-zinc-700 px-7 py-3 text-zinc-200"
          >
            로비로 돌아가기
          </button>
          <button
            type="button"
            onClick={async () => {
              await returnToRoom();
              router.replace(`/room/${roomId}`);
            }}
            className="rounded-lg bg-zinc-200 px-7 py-3 font-semibold text-zinc-950"
          >
            방으로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

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

  return (
    <>
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
    </>
  );
};
