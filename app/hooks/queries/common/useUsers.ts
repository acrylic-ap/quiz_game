// useUsers.ts
import { useQuery } from "@tanstack/react-query";
import { db } from "@/app/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().nickname,
        ...doc.data(),
      }));
      return users;
    },
  });
};
