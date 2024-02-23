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
  histories: List([]),
  setHistories: () => {},
  pushHistory: () => {},
  currentHistoryIndex: 0,
  setCurrentHistoryIndex: () => {},
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
  histories: List<List<Task>>;
  setHistories: (newHistories: List<List<Task>>) => void;
  pushHistory: (tasks: List<Task>) => void;
  currentHistoryIndex: number;
  setCurrentHistoryIndex: Dispatch<SetStateAction<number>>;
  assignees: Set<Assignee>;
  setAssignees: Dispatch<SetStateAction<Set<Assignee>>>;
};

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const historySize = 20;
  const [filePath, setFilePath] = useState("");
  const [userName, setUserName] = useState<Assignee>("");
  const [histories, _setHistories] = useState<List<List<Task>>>(List([]));
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const [assignees, setAssignees] = useState<Set<Assignee>>(new Set());

  const setHistories = useCallback(
    (newHistories: List<List<Task>>) => {
      const tailHistories = newHistories.takeLast(historySize);
      _setHistories(tailHistories);
      setCurrentHistoryIndex(tailHistories.size - 1);
    },
    [_setHistories]
  );

  const pushHistory = useCallback(
    (tasks: List<Task>) => {
      setHistories(histories.push(tasks));
    },
    [histories, setHistories]
  );

  const initializeData = useCallback(() => {
    loadInitialFilePath().then((newFilePath) => {
      loadData(
        newFilePath,
        setFilePath,
        setHistories,
        setAssignees,
        setUserName
      );
    });
  }, [setFilePath, setHistories, setAssignees, setUserName]);

  const tasks = histories.get(currentHistoryIndex)!;

  return (
    <GlobalContext.Provider
      value={{
        initializeData,
        filePath,
        setFilePath,
        userName,
        setUserName,
        tasks,
        histories,
        setHistories,
        pushHistory,
        currentHistoryIndex,
        setCurrentHistoryIndex,
        assignees,
        setAssignees,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
