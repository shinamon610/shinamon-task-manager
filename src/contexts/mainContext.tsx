import { Mode } from "@/vim/mode";
import { Dispatch, SetStateAction, createContext, useState } from "react";

export const MainContext = createContext<MainContextType>({
  mode: Mode.Normal,
  setMode: () => {},
});

type MainContextType = {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
};

export function MainProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState(Mode.Normal);
  return (
    <MainContext.Provider value={{ mode, setMode }}>
      {children}
    </MainContext.Provider>
  );
}
