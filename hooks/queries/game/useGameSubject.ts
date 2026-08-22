// useGameSubject.ts(firebase)
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const useGameSubject = (subjectId: string) => {
  return useQuery({
    queryKey: ["gameSubject", subjectId],
    queryFn: async () => {
      const docRef = doc(db, "gameSubjects", subjectId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error("Subject not found");
      }
      return docSnap.data();
    },
  });
};
