import { createContext, useState } from "react";

interface AppContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

export const AppContext = createContext<AppContextType>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const value = { isLoggedIn, setIsLoggedIn };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
