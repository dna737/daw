import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { useStorage } from "./storageHooks";
import { login as loginService } from "@/services";
export const useAuth = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(AppContext) as {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
  };
  const { setItem, removeItem, getItem } = useStorage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = getItem("isLoggedIn");
    setIsLoggedIn(isLoggedIn);
  }, []);

  const login = async (name: string, email: string) => {
    try{
    setIsLoading(true);
    const result = await loginService(name, email);
    if (result) {
      setIsLoggedIn(true);
      setItem("isLoggedIn", true);
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
    removeItem("isLoggedIn");
  };

  return { isLoggedIn, login, logout, isLoading };
}; 