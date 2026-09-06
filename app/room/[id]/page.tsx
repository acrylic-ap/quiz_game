"use client";

import KickedListModal from "@/app/room/[id]/_components/KickedListModal";
import { Header } from "./_components/Header";
import { Section } from "./_components/section/Section";

export default function RoomPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950 font-sans tracking-tight">
      <Header />
      <Section />
      <KickedListModal />
    </div>
  );
}
