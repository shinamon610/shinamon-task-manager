import { Assignee } from "@/models/assignee";
import { loadData, loadInitialFilePath } from "@/models/file";
import { Task } from "@/models/task";
import { List } from "immutable";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useState,
} from "react";

export const GlobalContext = createContext<GlobalContextType>({
  initializeData: () => {},
  filePath: "",
  setFilePath: () => {},
  userName: "",
  setUserName: () => {},
  tasks: List([]),
  setTasks: () => {},
  assignees: new Set(),
  setAssignees: () => {},
});

type GlobalContextType = {
  initializeData: () => void;
  filePath: string;
  setFilePath: Dispatch<SetStateAction<string>>;
  userName: Assignee;
  setUserName: Dispatch<SetStateAction<Assignee>>;
  tasks: List<Task>;
  setTasks: Dispatch<SetStateAction<List<Task>>>;
  assignees: Set<Assignee>;
  setAssignees: Dispatch<SetStateAction<Set<Assignee>>>;
};

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [filePath, setFilePath] = useState("");
  const [userName, setUserName] = useState<Assignee>("");
  const [tasks, setTasks] = useState<List<Task>>(List([]));
  const [assignees, setAssignees] = useState<Set<Assignee>>(new Set());

  const initializeData = useCallback(() => {
    loadInitialFilePath().then((newFilePath) => {
      loadData(newFilePath, setFilePath, setTasks, setAssignees, setUserName);
    });
  }, [setFilePath, setTasks, setAssignees, setUserName]);

  return (
    <GlobalContext.Provider
      value={{
        initializeData,
        filePath,
        setFilePath,
        userName,
        setUserName,
        tasks,
        setTasks,
        assignees,
        setAssignees,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
