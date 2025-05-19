import type { User } from "@/models";
import { createContext, useState } from "react";

export const AppContext = createContext({});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  console.log("isLoggedIn:", isLoggedIn);

  const login = () => {
    setIsLoggedIn(true);
  }

  const logout = () => {
    setIsLoggedIn(false);
  }

  const value = { isLoggedIn, login, logout }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
