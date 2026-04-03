"use client";

import { Send, SquareArrowRightExit } from "lucide-react";
import { useRouter } from "next/navigation";
// import { useAtom } from "jotai"; // 필요시 주석 해제하여 사용
import { useEffect, useState, useRef } from "react";

// --- 임시 데이터 (나중에 DB나 소켓에서 가져올 데이터) ---
const dummyUsers = [
  { id: 1, name: "김개발", avatar: "👤", isReady: true, isAdmin: true },
  { id: 2, name: "박리액트", avatar: "⚛️", isReady: true, isAdmin: false },
  { id: 3, name: "이테일", avatar: "🎨", isReady: false, isAdmin: false },
  { id: 4, name: "최조타이", avatar: "👻", isReady: false, isAdmin: false },
];

const dummyMessages = [
  {
    id: 1,
    user: "김개발",
    text: "ㅎㅇ",
    time: "10:30 PM",
  },
  { id: 2, user: "박리액트", text: "ㅎㅇㅎㅇ", time: "10:31 PM" },
  {
    id: 3,
    user: "시스템",
    text: "이테일 님이 입장하셨습니다.",
    time: "10:32 PM",
  },
];

// =========================================================

const Header = () => {
  const router = useRouter();

  return (
    // 네온 효과와 약간의 투명도를 준 상단 바
    <header
      className="sticky top-0 z-50 w-full h-20
    bg-zinc-950/80 backdrop-blur-sm border-b
    border-zinc-800 flex items-center justify-between
    px-6 shadow-lg shadow-black/20"
    >
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
          <span className="text-indigo-400">#AUGCFF</span> 아무나 들어오세요
        </h1>
      </div>

      <button
        className="rounded-xl
            text-lg font-semibold transition active:scale-95"
        onClick={() => {
          router.push("/");
        }}
      >
        <SquareArrowRightExit
          size={25}
          className="text-white hover:text-red-500"
        />
      </button>
    </header>
  );
};

export const RoomInfo = () => {
  return (
    <div
      className="h-20 flex flex-row items-center
    justify-between bg-zinc-900 rounded
    border border-zinc-800 px-6 shadow-xl"
    >
      <div className="text-zinc-400 flex items-center gap-3">
        <span className="text-xl font-bold text-zinc-100">선택 주제</span>
        <label className="text-lg">맞춤법 퀴즈 외 3개</label>
      </div>

      <div className=""></div>
    </div>
  );
};

const UserList = () => {
  return (
    <div className="flex-1 min-w-[300px] bg-zinc-900 rounded border border-zinc-800 p-5 flex flex-col gap-4 shadow-xl">
      <h2 className="text-lg font-semibold text-zinc-300 flex items-center gap-2">
        유저
      </h2>
      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {dummyUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between
            bg-zinc-800 p-3.5 rounded border border-zinc-700/50
            hover:border-indigo-500/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{user.avatar}</div>
              <div>
                <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                  {user.name}
                  {user.isAdmin && <span className="text-xs">👑</span>}
                </div>
                <div className="text-xs text-zinc-500">
                  #{user.id.toString().padStart(4, "0")}
                </div>
              </div>
            </div>
            {/* 상태 표시 */}
            <div
              className={`text-sm font-bold px-3 py-1 rounded-lg ${user.isReady ? "bg-emerald-950 text-emerald-300" : "bg-zinc-700 text-zinc-400"}`}
            >
              {user.isReady ? "READY" : "WAITING"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatSection = () => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dummyMessages]);

  const [messages, setMessages] = useState("");

  return (
    <div className="flex-[2] min-w-[400px] bg-zinc-900 rounded border border-zinc-800 flex flex-col shadow-xl">
      {/* 채팅 헤더 */}
      <div className="h-15 flex items-center p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-300">채팅</h2>
      </div>

      {/* 채팅 내용 */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto custom-scrollbar text-sm">
        {dummyMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.user === "시스템" ? "justify-center" : ""}`}
          >
            {msg.user !== "시스템" && (
              <div
                className="w-8 h-8 rounded-full
              bg-zinc-700 flex items-center justify-center
              font-bold text-zinc-300 mt-0.5"
              >
                {msg.user[0]}
              </div>
            )}
            <div
              className={`flex flex-col ${msg.user === "시스템" ? "items-center" : ""}`}
            >
              {msg.user !== "시스템" && (
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-zinc-200">
                    {msg.user}
                  </span>
                  <span className="text-xs text-zinc-600">{msg.time}</span>
                </div>
              )}
              <div
                className={`px-4 py-2 rounded-xl w-fit ${
                  msg.user === "시스템"
                    ? "bg-zinc-800 text-zinc-500 text-xs"
                    : "bg-zinc-800 text-zinc-100 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 채팅 입력창 */}
      <div className="p-4 border-t border-zinc-800 flex gap-2">
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          className="flex-1 bg-zinc-800
          border border-zinc-700 rounded-lg
          px-4 py-2.5 text-zinc-100
          placeholder:text-zinc-600 focus:outline-none
          transition"
          value={messages}
          onChange={(e) => setMessages(e.target.value)}
        />
        <button
          className={`
        text-white px-5 py-2.5 rounded-lg font-semibold
        transition active:scale-95
        ${
          messages
            ? "bg-indigo-600 hover:bg-indigo-500"
            : "bg-zinc-600 cursor-not-allowed"
        }`}
        >
          <Send />
        </button>
      </div>
    </div>
  );
};

const Section = () => {
  return (
    // 헤더를 제외한 나머지 화면 (flex 레이아웃 사용)
    <div className="relative w-full h-[calc(100vh-64px)] p-6 md:p-8 flex flex-col gap-6 bg-zinc-950 text-zinc-100">
      <RoomInfo />

      {/* 상단 콘텐츠 영역 (유저 목록 & 채팅) */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        <UserList />
        <ChatSection />
      </div>

      {/* 하단 버튼 영역 */}
      <div
        className="h-20 flex flex-row items-center
      justify-center"
      >
        <div className="flex gap-3">
          <button
            className="w-48 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl
            text-lg font-bold text-white shadow-lg shadow-indigo-500/30 transition active:scale-95 animate-pulse-slow"
          >
            게임 시작
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Room() {
  return (
    // 전체 화면 꽉 차게 설정 (h-screen)
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950 font-sans tracking-tight">
      <Header />
      <Section />
    </div>
  );
}
