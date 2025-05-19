import { useContext } from "react";
import { AppContext } from "@/context/AppContext";
import { useStorage } from "./storageHooks";
import { login as loginService } from "@/services";
export const useAuth = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(AppContext) as {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
  };
  const { setItem, removeItem } = useStorage();

  const login = async (name: string, email: string) => {
    const result = await loginService(name, email);
    if (result) {
      setIsLoggedIn(true);
      setItem("isLoggedIn", true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    removeItem("isLoggedIn");
  };

  return { isLoggedIn, login, logout };
}; 