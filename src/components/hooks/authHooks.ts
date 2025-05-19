import type { User } from "@/models";
import { useContext } from "react";
import { AppContext } from "@/context/AppContext";
import { login as loginService } from "@/services/proxy";

export const useAuth = () => {
  const { user, login, logout, isLoggedIn } = useContext(AppContext) as {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    isLoggedIn: boolean;
  };

  const handleLogin = async (name: string, email: string) => {
    const user = await loginService(name, email);
    login(user);
  };

  const handleLogout = () => {
    logout();
  };

  return { user, login, logout, isLoggedIn, handleLogin, handleLogout };
}
