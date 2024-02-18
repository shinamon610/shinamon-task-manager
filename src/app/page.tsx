"use client";
import { Assignee } from "@/models/assignee";
import { Task } from "@/models/task";
import { TopPage } from "@/pages/topPage";
import { Dispatch, SetStateAction, createContext, useState } from "react";

export const GlobalContext = createContext<GlobalContextType>({
  filePath: "",
  setFilePath: () => {},
  userName: "",
  setUserName: () => {},
  tasks: [],
  setTasks: () => {},
});

type GlobalContextType = {
  filePath: string;
  setFilePath: Dispatch<SetStateAction<string>>;
  userName: Assignee;
  setUserName: Dispatch<SetStateAction<Assignee>>;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
};
function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [filePath, setFilePath] = useState("");
  const [userName, setUserName] = useState<Assignee>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  return (
    <GlobalContext.Provider
      value={{ filePath, setFilePath, userName, setUserName, tasks, setTasks }}
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
