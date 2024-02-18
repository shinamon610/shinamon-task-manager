import { createContext } from "react";

export const MainContext = createContext<MainContextType>({});

type MainContextType = {};

export function MainProvider({ children }: { children: React.ReactNode }) {
  return <MainContext.Provider value={{}}>{children}</MainContext.Provider>;
}
