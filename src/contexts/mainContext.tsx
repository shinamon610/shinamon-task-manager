import { Mode } from "@/vim/mode";
import { Dispatch, SetStateAction, createContext, useState } from "react";

export const MainContext = createContext<MainContextType>({
  mode: Mode.Normal,
  setMode: () => {},
  filterTitle: "",
  setFilterTitle: () => {},
});

type MainContextType = {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  filterTitle: string;
  setFilterTitle: Dispatch<SetStateAction<string>>;
};

export function MainProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState(Mode.Normal);
  const [filterTitle, setFilterTitle] = useState("");
  return (
    <MainContext.Provider
      value={{ mode, setMode, filterTitle, setFilterTitle }}
    >
      {children}
    </MainContext.Provider>
  );
}
