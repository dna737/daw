import type { User } from "@/models";
import { useContext } from "react";
import { AppContext } from "@/context/AppContext";

export const useAuth = () => {
  const { user, login, logout, isLoggedIn } = useContext(AppContext) as {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    isLoggedIn: boolean;
  };

  return { user, login, logout, isLoggedIn };
}
