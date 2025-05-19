import type { User } from "@/models";
import { createContext, useState } from "react";

export const AppContext = createContext({});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(localStorage.getItem("isLoggedIn") === "true");
  console.log("isLoggedIn:", isLoggedIn);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  }

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  }

  const value = { isLoggedIn, login, logout }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
