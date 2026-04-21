"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { User } from "lucide-react";

export default function UserInfoModal({ user }: any) {
  const [roomCode, setRoomCode] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className="flex flex-row justify-center
                          py-2 bg-zinc-900
                          hover:bg-zinc-950 mb-2
                          text-left
                          rounded"
        >
          <p className="mr-1 w-15 truncate">{user.nickname}</p>
          <User />
        </div>
      </DialogTrigger>

      <DialogContent className="bg-zinc-950 text-zinc-100 select-none">
        <DialogHeader className="flex items-center">
          <DialogTitle className="text-xl flex items-center font-semibold">
            내 정보
          </DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
