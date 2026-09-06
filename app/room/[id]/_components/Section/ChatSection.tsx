import { currentRoomIdAtom } from "@/atoms/roomAtom";
import { useAuth } from "@/hooks/queries/common/account/useAuth";
import { useSendMessage } from "@/hooks/queries/room/actions/useSendMessage";
import { useChatMessages } from "@/hooks/queries/room/crud/useChatQuery";
import { useRoomSubscription } from "@/hooks/queries/room/crud/useRoomQuery";
import { useAtomValue } from "jotai";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const ChatSection = () => {
  const roomId = useAtomValue(currentRoomIdAtom);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");

  const { data: messages = [] } = useChatMessages(roomId);
  const { data: room } = useRoomSubscription(roomId);
  const { data: user } = useAuth();

  const sendMessageMutation = useSendMessage();

  const isOwner = user?.uid === room?.config.ownerId;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = () => {
    if (!user) return;

    const text = message.trim();

    if (!text || sendMessageMutation.isPending) {
      return;
    }

    sendMessageMutation.mutate(
      {
        username: user.nickname,
        text,
        isAdmin: isOwner,
      },
      {
        onSuccess: () => {
          setMessage("");
        },
      },
    );
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
            className={`flex gap-3 ${
              msg.username === "시스템" ? "justify-center" : ""
            }`}
          >
            {msg.username !== "시스템" && (
              <div
                className="w-8 h-8 rounded-full
                bg-zinc-700 flex items-center justify-center
                font-bold text-zinc-300 mt-0.5"
              >
                {msg.username?.[0] ?? ""}
              </div>
            )}

            <div
              className={`flex flex-col ${
                msg.username === "시스템" ? "items-center" : ""
              }`}
            >
              {msg.username !== "시스템" && (
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-zinc-100">
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
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              handleSend();
            }
          }}
        />

        <button
          className={`
            text-white px-5 py-2.5 rounded-lg font-semibold
            transition active:scale-95
            ${
              message.trim()
                ? "bg-indigo-600 hover:bg-indigo-500"
                : "bg-zinc-600 cursor-not-allowed"
            }
          `}
          disabled={sendMessageMutation.isPending || !message.trim()}
          onClick={handleSend}
        >
          <Send />
        </button>
      </div>
    </div>
  );
};
