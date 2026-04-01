"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { User } from "lucide-react";
import { useState } from "react";

export default function RoomModal() {
  const [selectedCapacity, setSelectedCapacity] = useState(2);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="px-6 py-2 mr-2 rounded-sm
                  text-lg bg-zinc-900
                  hover:bg-zinc-800"
        >
          방 생성
        </button>
      </DialogTrigger>

      <DialogContent className="bg-zinc-950 text-zinc-100">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">방 생성</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              id="room-name"
              placeholder="방 제목을 입력하세요"
              className="bg-zinc-900 text-zinc-100
              rounded pl-2 py-3
              outline-none
              placeholder:text-zinc-500"
            />
          </div>
          <div
            className="relative w-full my-5
            flex flex-row items-center space-x-2"
          >
            <h2 className="shrink-0 text-lg font-bold">인원</h2>
            <div
              className="w-full
                flex flex-row justify-center gap-2"
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => index >= 1 && setSelectedCapacity(index + 1)}
                >
                  <User
                    className={
                      selectedCapacity >= index + 1
                        ? "text-white"
                        : "text-zinc-500"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <div
            className="relative flex flex-row items-center
          my-6 space-x-2"
          >
            <h2 className="font-bold text-lg mr-4">주제</h2>
            <label>선택된 주제가 없습니다.</label>
            <div className="absolute right-0">
              <button
                className="px-3 py-1 mr-1 rounded
              text bg-zinc-900
              hover:bg-zinc-800"
              >
                ...
              </button>
              <button
                className="px-3 py-1 rounded
              text bg-zinc-900
              hover:bg-zinc-800"
              >
                랜덤
              </button>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <h2 className="font-bold text-lg mr-4">공개</h2>
            <Switch className="data-[state=checked]:bg-blue-500" />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            className="w-30 px-6 py-2 rounded
              text bg-zinc-900
              hover:bg-zinc-800"
          >
            방 생성
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
