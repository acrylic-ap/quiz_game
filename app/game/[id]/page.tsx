"use client";

import { useMemo, useState } from "react";
import {
  Trophy,
  Clock3,
  Crown,
  ChevronRight,
  Users,
  RotateCcw,
  DoorOpen,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useRoomUsers } from "@/app/hooks/queries/room/queries/useRoomUsers";
import { useRoomSubscription } from "@/app/hooks/queries/room/queries/useRoomQuery";

const players = [
  { name: "Minho", score: 1800, correct: true },
  { name: "Yuna", score: 1450, correct: false },
  { name: "Jisoo", score: 1280, correct: false },
  { name: "Haru", score: 1100, correct: false },
];

const categories = ["게임", "애니", "영화", "과학", "스포츠", "음악", "과자"];

const answers = ["피카츄", "라이츄", "파이리", "꼬부기"];

const Header = () => {
  const params = useParams();
  const roomId = params?.roomId as string;

  const { data: roomData } = useRoomSubscription(roomId);

  console.log(roomData);

  return (
    <div className="relative flex h-[10%] min-h-[92px] w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900">
          <Trophy className="h-5 w-5 text-zinc-200" />
        </div>

        <div>
          <h1 className="text-lg font-semibold text-zinc-100">
            {roomData?.roomName}
          </h1>
          <p className="text-sm text-zinc-400">#{roomId}</p>
        </div>
      </div>
    </div>
  );
};

const TopicDecisionCard = () => {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/20">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-zinc-100">
              플레이어 투표 진행 중
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              가장 많은 표를 받은 주제로 시작돼요
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
            12초 남음
          </div>
        </div>

        <div className="h-70 grid gap-3 md:grid-cols-2 overflow-y-auto no-scrollbar">
          {categories.map((category, index) => (
            <button
              key={category}
              className={`rounded-2xl border px-5 py-4 text-left transition-all ${
                index === 0
                  ? "border-zinc-500 bg-zinc-800"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-zinc-100">{category}</span>
                <span className="text-sm text-zinc-500">{12 - index}표</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full ${
                    index === 0 ? "bg-zinc-200" : "bg-zinc-600"
                  }`}
                  style={{ width: `${90 - index * 12}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 opacity-70">
          <div className="mb-2 text-sm font-medium text-zinc-300">
            랜덤 결정일 경우
          </div>

          <p className="text-sm leading-relaxed text-zinc-500">
            선택된 주제를 빠르게 섞은 뒤 랜덤 결과만 잠깐 보여주고 바로 시작
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 opacity-70">
          <div className="mb-2 text-sm font-medium text-zinc-300">
            항시 랜덤일 경우
          </div>

          <p className="text-sm leading-relaxed text-zinc-500">
            매 라운드 자동 랜덤 선택 후 즉시 문제 화면으로 전환
          </p>
        </div>
      </div>
    </div>
  );
};

const QuestionSection = () => {
  const [questionType, setQuestionType] = useState("select");

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-4">
            <div className="rounded-2xl border border-zinc-600 bg-zinc-950 px-4 py-2 text-sm text-zinc-300">
              Round <span className="font-semibold text-white">3 / 10</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-zinc-100">
            포켓몬 전기 타입 대표 캐릭터는?
          </h2>
        </div>

        <button
          onClick={() =>
            setQuestionType((prev) => (prev === "select" ? "input" : "select"))
          }
          className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500"
        >
          유형 변경
        </button>

        <div className="flex items-center gap-2 rounded-2xl border border-emerald-900/70 bg-emerald-950/40 px-4 py-3">
          <Clock3 className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold text-emerald-300">18s</span>
        </div>
      </div>

      {questionType === "select" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {answers.map((answer, index) => (
            <button
              key={answer}
              className="group flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-left transition-all hover:border-zinc-600 hover:bg-zinc-800"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-sm font-semibold text-zinc-200">
                  {index + 1}
                </div>

                <span className="text-zinc-100">{answer}</span>
              </div>

              <ChevronRight className="h-4 w-4 text-zinc-500 transition group-hover:text-zinc-300" />
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
            <input
              placeholder="정답을 입력하세요"
              className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-zinc-100 outline-none transition focus:border-zinc-500"
            />
          </div>

          <button className="w-full rounded-2xl bg-zinc-100 py-4 font-semibold text-zinc-900 transition hover:bg-white">
            정답 제출
          </button>
        </div>
      )}
    </div>
  );
};

const RankingSection = () => {
  const params = useParams();
  const roomId = params?.roomId as string;

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.score - a.score),
    [],
  );

  const { data: users = [] } = useRoomUsers(roomId);

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">실시간 순위</h2>
          <p className="text-sm text-zinc-400">정답 순서 기반 점수</p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
          <Users className="h-4 w-4" />4 Players
        </div>
      </div>

      <div className="space-y-3">
        {users.map((player, index) => (
          <div
            key={player.nickname}
            className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold ${
                  index === 0
                    ? "border-yellow-700 bg-yellow-950/40 text-yellow-200"
                    : "border-zinc-700 bg-zinc-900 text-zinc-200"
                }`}
              >
                {index === 0 ? <Crown className="h-4 w-4" /> : index + 1}
              </div>

              <div>
                <div className="font-medium text-zinc-100">
                  {player.nickname}
                </div>
                <div className="text-sm text-zinc-500">
                  {/* {player.correct ? "풀이 완료" : "문제 푸는 중"} */}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-right">
              <div className="text-lg font-semibold text-zinc-100">
                {/* {player.score} */}
              </div>
              <div className="text-xs text-zinc-500">점</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultModal = () => {
  return (
    <div className="rounded-3xl border border-zinc-700 bg-zinc-950/95 p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-yellow-700 bg-yellow-950/30">
          <Trophy className="h-7 w-7 text-yellow-200" />
        </div>

        <h2 className="text-3xl font-bold text-zinc-100">게임 종료</h2>
        <p className="mt-2 text-zinc-400">모든 라운드가 종료되었어요</p>
      </div>

      <div className="mb-6 space-y-3">
        {players.map((player, index) => (
          <div
            key={player.name}
            className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 font-semibold text-zinc-200">
                #{index + 1}
              </div>

              <span className="font-medium text-zinc-100">{player.name}</span>
            </div>

            <div className="text-lg font-semibold text-zinc-100">
              {player.score}점
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="mb-2 text-sm font-medium text-zinc-100">
          다시 시작 대기 상태
        </div>

        <p className="text-sm leading-relaxed text-zinc-400">
          방장이 먼저 대기실로 이동한 뒤 모든 플레이어가 동의하면 다시 게임을
          시작할 수 있어요.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <button className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 py-4 font-medium text-zinc-200 transition hover:border-zinc-500">
          <DoorOpen className="h-4 w-4" />
          나가기
        </button>

        <button className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-100 py-4 font-semibold text-zinc-900 transition hover:bg-white">
          <RotateCcw className="h-4 w-4" />
          대기실 이동
        </button>
      </div>
    </div>
  );
};

const Section = () => {
  return (
    <div className="relative flex h-[90%] w-full gap-5 overflow-hidden bg-zinc-950 p-5">
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
        <TopicDecisionCard />
        {/* <QuestionSection /> */}
      </div>

      <div className="w-[360px] shrink-0 overflow-y-auto">
        <RankingSection />
      </div>

      {/* <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
        <div className="w-full max-w-xl">
          <ResultModal />
        </div>
      </div> */}
    </div>
  );
};

export default function GamePage() {
  return (
    <div className="h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="mx-auto flex h-full max-w-[1700px] flex-col">
        <Header />
        <Section />
      </div>
    </div>
  );
}
