import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { useStorage } from "./storageHooks";
import { login as loginService } from "@/services";
import { IS_LOGGED_IN_KEY } from "../utils/constants";
export const useAuth = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(AppContext) as {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
  };
  const { setItem, removeItem, getItem } = useStorage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = getItem(IS_LOGGED_IN_KEY);
    setIsLoggedIn(isLoggedIn);
  }, []);

  const login = async (name: string, email: string) => {
    try{
    setIsLoading(true);
    const result = await loginService(name, email);
    if (result) {
      setIsLoggedIn(true);
      setItem(IS_LOGGED_IN_KEY, true);
      setIsLoading(false);
      return true;
    }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Error logging in:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    removeItem(IS_LOGGED_IN_KEY);
  };

  return { isLoggedIn, login, logout, isLoading };
}; 