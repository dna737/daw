import { createContext, useState } from "react";

export const AppContext = createContext({});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const value = { isLoggedIn, setIsLoggedIn };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
