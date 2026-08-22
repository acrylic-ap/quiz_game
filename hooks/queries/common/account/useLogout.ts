import { getAuth, signOut } from "firebase/auth";

export const useLogout = () => {
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };
  return { handleLogout };
};
