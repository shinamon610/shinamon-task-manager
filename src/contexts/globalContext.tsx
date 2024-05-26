import { toposort } from "@/lib/topologicalSort";
import { Assignee } from "@/models/assignee";
import { loadData, loadInitialFilePath, saveData } from "@/models/file";
import { DefaultStatus } from "@/models/status";
import {
  Task,
  UUID,
  getAllTasksFromSource,
  getAllTasksFromTarget,
} from "@/models/task";
import { getCircularIndex } from "@/utils";
import { List } from "immutable";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

export const GlobalContext = createContext<GlobalContextType>({
  saveTasks: () => {},
  initializeData: () => {},
  filePath: "",
  setFilePath: () => {},
  userName: "",
  setUserName: () => {},
  tasks: List([]),
  histories: List([]),
  setHistories: () => {},
  pushHistory: () => {},
  prevHistory: () => {},
  nextHistory: () => {},
  currentHistoryIndex: 0,
  setCurrentHistoryIndex: () => {},
  assignees: new Set(),
  setAssignees: () => {},
  stackedTasks: List([]),
  dependentIds: List([]),
  swappable: [false, false],
});

type GlobalContextType = {
  saveTasks: (tasks: List<Task>) => void;
  initializeData: () => void;
  filePath: string;
  setFilePath: Dispatch<SetStateAction<string>>;
  userName: Assignee;
  setUserName: Dispatch<SetStateAction<Assignee>>;
  tasks: List<Task>;
  histories: List<List<Task>>;
  setHistories: (newHistories: List<List<Task>>) => void;
  pushHistory: (tasks: List<Task>) => void;
  prevHistory: () => void;
  nextHistory: () => void;
  currentHistoryIndex: number;
  setCurrentHistoryIndex: Dispatch<SetStateAction<number>>;
  assignees: Set<Assignee>;
  setAssignees: Dispatch<SetStateAction<Set<Assignee>>>;
  stackedTasks: List<Task>;
  dependentIds: List<UUID>;
  swappable: [boolean, boolean];
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

  const prevHistory = useCallback(() => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  }, [currentHistoryIndex]);

  const nextHistory = useCallback(() => {
    if (currentHistoryIndex < histories.size - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    }
  }, [currentHistoryIndex, histories.size]);

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

  const _tasks = histories.get(currentHistoryIndex);
  const tasks = _tasks === undefined ? List([]) : _tasks;

  const stackedTasks = useMemo(() => {
    if (_tasks === undefined) {
      return List([]);
    }
    const _stackedTaskIds = _tasks
      .filter(
        (task) =>
          task.assignee === userName && task.status !== DefaultStatus.Done
      )
      .map(({ id }) => id);
    return toposort(_tasks).filter((task) => _stackedTaskIds.includes(task.id));
  }, [_tasks, userName]);

  const dependentIds = useMemo(() => {
    const selectedId = stackedTasks.find((task) => task.isSelected)?.id;
    if (selectedId === undefined) return List([]);
    const candidates = getAllTasksFromSource(tasks, selectedId)
      .concat(getAllTasksFromTarget(tasks, selectedId))
      .map(({ id }) => id);
    return stackedTasks
      .filter((card) => candidates.includes(card.id))
      .map(({ id }) => id);
  }, [tasks, stackedTasks]);

  const swappable = useMemo(() => {
    const selectedIndex = stackedTasks.findIndex((task) => task.isSelected);
    if (selectedIndex === -1) return [false, false] as [boolean, boolean];
    return [-1, +1].map((diff) => {
      return !dependentIds.includes(
        stackedTasks.get(
          getCircularIndex(selectedIndex, stackedTasks.size, diff)
        )!.id
      );
    }) as [boolean, boolean];
  }, [dependentIds, stackedTasks]);

  const saveTasks = (newTasks: List<Task>) => {
    saveData({ tasks: newTasks, userName }, filePath);
  };

  return (
    <GlobalContext.Provider
      value={{
        saveTasks,
        initializeData,
        filePath,
        setFilePath,
        userName,
        setUserName,
        tasks,
        histories,
        setHistories,
        pushHistory,
        prevHistory,
        nextHistory,
        currentHistoryIndex,
        setCurrentHistoryIndex,
        assignees,
        setAssignees,
        stackedTasks,
        dependentIds,
        swappable: swappable,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
