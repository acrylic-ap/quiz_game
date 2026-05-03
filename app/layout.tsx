import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "jotai";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import TopicModal from "./components/common/modals/topic/TopicModal";
import AlertModal from "./components/common/modals/alert/AlertModal";
import RoomModal from "./components/common/modals/room/RoomModal";
import LoginModal from "./components/common/modals/login/LoginModal";
import Providers from "./providers";
import SelectModal from "./components/common/modals/select/SelectModal";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "퀴즈",
  description: "걍 퀴즈",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={cn("font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body
        className="w-full h-full bg-black
                  flex flex-col text-white"
      >
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
        <Providers>
          <Provider>
            <TopicModal />
            <AlertModal />
            <SelectModal />
            <RoomModal />
            <LoginModal />
            {children}
          </Provider>
        </Providers>
      </body>
    </html>
  );
}
