import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "jotai";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="ko" className={cn("font-sans", inter.variable)}>
      <body
        className="w-full h-full bg-black
                  flex flex-col text-white"
      >
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
