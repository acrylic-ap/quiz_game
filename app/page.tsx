"use client";

import { useAtom } from "jotai";
import { preventClickState } from "./atoms/modalAtom";
import { Header } from "@/app/_components/Header";
import { Section } from "@/app/_components/Section";

export default function Home() {
  const [preventClick] = useAtom(preventClickState);

  if (preventClick) return null;

  return (
    <div
      className="w-full h-full
                flex flex-col
                font-[Pretendard]"
    >
      <Header />
      <Section />
    </div>
  );
}
