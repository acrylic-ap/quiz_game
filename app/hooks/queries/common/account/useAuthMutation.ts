import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auth, db } from "@/app/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export const useGoogleLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const defaultNickname = user.displayName || "닉네임 없음";
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
      return user;
    },
    onSuccess: () => {
      // ✅ 로그인 성공 시 'user' 쿼리를 무효화하여 최신 정보를 다시 가져오게 합니다.
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Google login failed", error);
    },
  });
};
