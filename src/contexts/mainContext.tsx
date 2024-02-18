import { Assignee } from "@/models/assignee";
import { Status } from "@/models/status";
import { Mode } from "@/vim/mode";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { Task, UUID, filterTasks } from "../models/task";
import { GlobalContext } from "./globalContext";

export const MainContext = createContext<MainContextType>({
  mode: Mode.Normal,
  setMode: () => {},
  title: "",
  setTitle: () => {},
  filterTitle: "",
  setFilterTitle: () => {},
  filterStatus: null,
  setFilterStatus: () => {},
  filterAssignee: null,
  setFilterAssignee: () => {},
  filterSources: new Set<UUID>([]),
  setFilterSources: () => {},
  filterTargets: new Set<UUID>([]),
  setFilterTargets: () => {},
  filterMemo: "",
  setFilterMemo: () => {},
  filteredTasks: [],
});

type MainContextType = {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  filterTitle: string;
  setFilterTitle: Dispatch<SetStateAction<string>>;
  filterStatus: Status | null;
  setFilterStatus: Dispatch<SetStateAction<Status | null>>;
  filterAssignee: Assignee | null;
  setFilterAssignee: Dispatch<SetStateAction<Assignee | null>>;
  filterSources: Set<UUID>;
  setFilterSources: Dispatch<SetStateAction<Set<UUID>>>;
  filterTargets: Set<UUID>;
  setFilterTargets: Dispatch<SetStateAction<Set<UUID>>>;
  filterMemo: string;
  setFilterMemo: Dispatch<SetStateAction<string>>;
  filteredTasks: Task[];
};

export function MainProvider({ children }: { children: React.ReactNode }) {
  const { tasks } = useContext(GlobalContext);
  const [mode, setMode] = useState(Mode.Normal);
  const [title, setTitle] = useState("");
  const [filterTitle, setFilterTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<Assignee | null>(null);
  const [filterSources, setFilterSources] = useState<Set<UUID>>(
    new Set<UUID>([])
  );
  const [filterTargets, setFilterTargets] = useState<Set<UUID>>(
    new Set<UUID>([])
  );
  const [filterMemo, setFilterMemo] = useState("");
  const filteredTasks = useMemo(() => {
    return filterTasks(
      tasks,
      filterTitle,
      filterStatus,
      filterAssignee,
      filterSources,
      filterTargets,
      filterMemo
    );
  }, [
    tasks,
    filterTitle,
    filterStatus,
    filterAssignee,
    filterSources,
    filterTargets,
    filterMemo,
  ]);

  return (
    <MainContext.Provider
      value={{
        mode,
        setMode,
        title,
        setTitle,
        filterTitle,
        setFilterTitle,
        filterStatus,
        setFilterStatus,
        filterAssignee,
        setFilterAssignee,
        filterSources,
        setFilterSources,
        filterTargets,
        setFilterTargets,
        filterMemo,
        setFilterMemo,
        filteredTasks,
      }}
    >
      {children}
    </MainContext.Provider>
  );
}
