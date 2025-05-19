import { useContext, useEffect } from "react";
import { AppContext } from "@/context/AppContext";
import { login as loginService } from "@/services/proxy";

export const useAuth = () => {
  const { login, logout, isLoggedIn } = useContext(AppContext) as {
    login: () => void;
    logout: () => void;
    isLoggedIn: boolean;
  };

  // Returns true if login is successful, false otherwise
  const handleLogin = async (name: string, email: string): Promise<boolean> => {
    try {
      const success = await loginService(name, email);
      if (success) {
        login();
        return true;
      }
    } catch (error) {
      console.error(error);
    } 
    return false;
  };

  const handleLogout = () => {
    logout();
  };

  return { isLoggedIn, handleLogin, handleLogout };
}
