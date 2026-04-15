import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export const useUser = () => {
  const queryClient = useQueryClient();
  const queryKey = ["user"];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      queryClient.invalidateQueries({ queryKey });
    });
    return () => unsubscribe();
  }, [queryClient]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return null;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      const nickname = userSnap.exists()
        ? userSnap.data().nickname
        : user.displayName || "닉네임 없음";

      return {
        uid: user.uid,
        nickname,
        email: user.email,
      };
    },
    staleTime: Infinity,
  });
};
