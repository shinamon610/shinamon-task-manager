"use client";
import { Assignee } from "@/models/assignee";
import { TopPage } from "@/pages/topPage";
import { Dispatch, SetStateAction, createContext, useState } from "react";

export const GlobalContext = createContext<GlobalContextType>({
  filePath: "",
  setFilePath: () => {},
  userName: "",
  setUserName: () => {},
});

type GlobalContextType = {
  filePath: string;
  setFilePath: Dispatch<SetStateAction<string>>;
  userName: Assignee;
  setUserName: Dispatch<SetStateAction<Assignee>>;
};
function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [filePath, setFilePath] = useState("");
  const [userName, setUserName] = useState<Assignee>("");
  return (
    <GlobalContext.Provider
      value={{ filePath, setFilePath, userName, setUserName }}
    >
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
