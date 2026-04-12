"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useAtom } from "jotai";
import { loginModalState } from "@/app/atom/modalAtom";
import { useRouter } from "next/navigation";
import { GoogleLogo } from "@/public/svg/Google";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase"; // rtdb 대신 db(firestore) 임포트
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore"; // firestore 메서드 임포트

export default function LoginModal() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useAtom(loginModalState);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      localStorage.setItem("userId", user.uid);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const defaultNickname = user.displayName || "닉네임 없음";
        
        localStorage.setItem("userNickname", defaultNickname);

        await setDoc(userRef, {
          uid: user.uid,
          nickname: defaultNickname,
          email: user.email || null,
          photoURL: user.photoURL || null,
          provider: "google",
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      } else {
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          photoURL: user.photoURL || null,
        });
      }

      setShowLoginModal(false);
      router.replace("/");
    } catch (err) {
      console.error("Google login failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
      <DialogContent className="bg-zinc-950 text-zinc-100 select-none">
        <DialogHeader className="flex items-center">
          <DialogTitle className="text-xl flex items-center font-semibold">
            로그인
          </DialogTitle>
        </DialogHeader>

        <div className="w-full flex items-center flex-col">
          <button
            className="bg-zinc-800 w-50 h-[40px] rounded
                          flex justify-center items-center
                          hover:bg-zinc-700
                          outline-none"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <div className="flex items-center gap-2">
              <GoogleLogo />
              <p className="text-zinc-300">Sign up with Google</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}