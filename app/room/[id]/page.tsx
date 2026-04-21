"use client";

import {
  Eye,
  EyeClosed,
  Send,
  Settings,
  SquareArrowRightExit,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { useEffect, useState, useRef } from "react";
import { setRoomModalState } from "@/app/atom/modalAtom";
import { db, rtdb } from "@/app/lib/firebase";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { getDisplayTopic } from "@/app/components/common/utils/topic";
import { useRoomSubscription } from "@/app/hooks/queries/room/useRoomQuery";
import { useChatMessages } from "@/app/hooks/queries/room/useChatQuery";
import { useMutation } from "@tanstack/react-query";
import { ref, remove } from "firebase/database";
import { useRoomUsers } from "@/app/hooks/queries/room/useRoomUsers";
import { useUser } from "@/app/hooks/queries/lobby/useAuth";

// =========================================================

const Header = () => {
  const router = useRouter();
  const roomId = usePathname().split("/").pop();

  const { data: roomData } = useRoomSubscription(roomId);
  const { data: users } = useRoomUsers(roomId);
  const { data: user } = useUser();

  const handleExit = async () => {
    if (!users || !user) return;

    const currentUser = users.find((u) => u.id === user.uid);

    if (!roomId || !currentUser) return;

    if (currentUser.isOwner) {
      // 1. RTDB 세션 폭파 (연결된 모든 유저에게 영향)
      await remove(ref(rtdb, `room_sessions/${roomId}`));
      // 2. Firestore 방 목록 삭제
      await deleteDoc(doc(db, "rooms", roomId));
    } else {
      // 일반 유저라면 본인 노드만 삭제 (위에서 짠 onDisconnect와 별개로 즉시 실행)
      await remove(ref(rtdb, `room_sessions/${roomId}/users/${user.uid}`));
    }

    router.push("/");
  };

  return (
    <header
      className="sticky top-0 z-50 w-full h-20
    bg-zinc-950/80 backdrop-blur-sm border-b
    border-zinc-800 flex items-center justify-between
    px-6 shadow-lg shadow-black/20"
    >
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
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

// ----------------------------------------------------------------

export const RoomInfo = () => {
  const roomId = usePathname().split("/").pop();

  const [, setRoomDescription] = useAtom(setRoomModalState);

  const { data: roomData } = useRoomSubscription(roomId);

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
          {roomData?.topicItem && getDisplayTopic(roomData?.topicItem)}
        </label>
      </div>

      <div className="h-fit flex">
        <button onClick={() => setRoomDescription("edit")}>
          <Settings
            size={22}
            className="text-zinc-400 hover:text-zinc-200 transition"
          />
        </button>
      </div>
    </div>
  );
};

const UserList = () => {
  const roomId = usePathname().split("/").pop();
  const { data: roomData } = useRoomSubscription(roomId);

  const { data: users = [] } = useRoomUsers(roomId);

  return (
    <div
      className="flex-1 min-w-[300px] bg-zinc-900
          rounded-lg border border-zinc-800 p-4
          flex flex-col gap-4 shadow-xl"
    >
      <h2
        className="flex items-center gap-2
          text-lg text-zinc-300 font-semibold"
      >
        참여자
        <span className="text-zinc-400">
          {users?.length}/{roomData?.maxCapacity}
        </span>
      </h2>
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
            </div>
            {/* 상태 표시 */}
            {!user.isOwner && (
              <div
                className={`text-sm px-3 py-1 rounded-lg ${user.isReady ? "bg-emerald-950 text-emerald-300" : "bg-zinc-700 text-zinc-400"}`}
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

const ChatSection = () => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const roomId = usePathname().split("/").pop();

  const [message, setMessage] = useState("");

  const { data: messages = [] } = useChatMessages(roomId);

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      const docRef = collection(db, `rooms/${roomId}/chats`);
      await addDoc(docRef, {
        username: "Acrylic",
        text,
        time: new Date(),
        isAdmin: true,
      });
    },
    onSuccess: () => setMessage(""),
    onError: (error: any) => {
      console.error("전송 에러:", error);
      alert(
        error.code === "permission-denied"
          ? "권한이 없습니다."
          : "네트워크 오류",
      );
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) sendMessageMutation.mutate(message);
  };

  return (
    <div className="flex-[2] min-w-[400px] bg-zinc-900 rounded-lg border border-zinc-800 flex flex-col shadow-xl">
      <div className="h-15 flex items-center p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-300">채팅</h2>
      </div>

      <div className="flex-1 p-5 space-y-4 overflow-y-auto no-scrollbar text-sm min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.username === "시스템" ? "justify-center" : ""}`}
          >
            {msg.username !== "시스템" && (
              <div
                className="w-8 h-8 rounded-full
              bg-zinc-700 flex items-center justify-center
              font-bold text-zinc-300 mt-0.5"
              >
                {msg.username[0]}
              </div>
            )}
            <div
              className={`flex flex-col ${msg.username === "시스템" ? "items-center" : ""}`}
            >
              {msg.username !== "시스템" && (
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-zinc-200">
                    {msg.username}
                  </span>
                  <span className="text-xs text-zinc-600">{msg.time}</span>
                </div>
              )}
              <div
                className={`px-4 py-2 rounded-xl w-fit ${
                  msg.username === "시스템"
                    ? "bg-zinc-800 text-zinc-500 text-xs"
                    : "bg-zinc-800 text-zinc-100 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 flex gap-2">
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          className="flex-1 bg-zinc-800
          border border-zinc-700 rounded-lg
          px-4 py-2.5 text-zinc-100
          hover:border-zinc-500
          placeholder:text-zinc-600 outline-none
          transition"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          className={`
        text-white px-5 py-2.5 rounded-lg font-semibold
        transition active:scale-95
        ${
          message
            ? "bg-indigo-600 hover:bg-indigo-500"
            : "bg-zinc-600 cursor-not-allowed"
        }`}
          disabled={sendMessageMutation.isPending}
          onClick={handleSend}
        >
          <Send />
        </button>
      </div>
    </div>
  );
};

const Section = () => {
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
          <button
            className="w-48 h-12 bg-indigo-600 hover:bg-indigo-500 rounded-xl
            text-lg font-bold text-white shadow-lg
            shadow-indigo-500/30 transition active:scale-95
            outline-none
            animate-pulse-slow"
          >
            게임 시작
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RoomPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950 font-sans tracking-tight">
      <Header />
      <Section />
    </div>
  );
}
