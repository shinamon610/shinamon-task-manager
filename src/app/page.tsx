"use client";
import { TopPage } from "@/pages/topPage";
import { Dispatch, SetStateAction, createContext, useState } from "react";

export const GlobalContext = createContext<GlobalContextType>({
  filePath: "",
  setFilePath: () => {},
});

type GlobalContextType = {
  filePath: string;
  setFilePath: Dispatch<SetStateAction<string>>;
};
function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [filePath, setFilePath] = useState("");
  return (
    <GlobalContext.Provider value={{ filePath, setFilePath }}>
      {children}
    </GlobalContext.Provider>
  );
}

const HomePage = () => {
  return (
    <GlobalProvider>
      <TopPage />
    </GlobalProvider>
  );
};

export default HomePage;
