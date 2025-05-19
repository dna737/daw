import type { User } from "@/models";
import { createContext, useState } from "react";

export const AppContext = createContext({});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  }

  const value = { user, login, logout }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
