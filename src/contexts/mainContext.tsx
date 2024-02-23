import { Assignee } from "@/models/assignee";
import { DefaultStatus, Status } from "@/models/status";
import { Mode } from "@/vim/mode";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { Task, filterTasks, taskUUID } from "../models/task";
import { GlobalContext } from "./globalContext";

export const MainContext = createContext<MainContextType>({
  mode: Mode.Normal,
  setMode: () => {},
  title: "",
  setTitle: () => {},
  selectedAssignee: null,
  setSelectedAssignee: () => {},
  selectedSources: new Set<taskUUID>([]),
  setSelectedSources: () => {},
  selectedTargets: new Set<taskUUID>([]),
  setSelectedTargets: () => {},
  memo: "",
  setMemo: () => {},

  filterTitle: "",
  setFilterTitle: () => {},
  filterStatus: null,
  setFilterStatus: () => {},
  filterAssignee: null,
  setFilterAssignee: () => {},
  filterSources: new Set<taskUUID>([]),
  setFilterSources: () => {},
  filterTargets: new Set<taskUUID>([]),
  setFilterTargets: () => {},
  filterMemo: "",
  setFilterMemo: () => {},
  filteredTasks: [],
  selectedStatus: DefaultStatus.Pending,
  setSelectedStatus: () => {},
});

type MainContextType = {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  selectedStatus: Status;
  setSelectedStatus: Dispatch<SetStateAction<Status>>;
  selectedAssignee: Assignee | null;
  setSelectedAssignee: Dispatch<SetStateAction<Assignee | null>>;
  selectedSources: Set<taskUUID>;
  setSelectedSources: Dispatch<SetStateAction<Set<taskUUID>>>;
  selectedTargets: Set<taskUUID>;
  setSelectedTargets: Dispatch<SetStateAction<Set<taskUUID>>>;
  memo: string;
  setMemo: Dispatch<SetStateAction<string>>;

  filterTitle: string;
  setFilterTitle: Dispatch<SetStateAction<string>>;
  filterStatus: Status | null;
  setFilterStatus: Dispatch<SetStateAction<Status | null>>;
  filterAssignee: Assignee | null;
  setFilterAssignee: Dispatch<SetStateAction<Assignee | null>>;
  filterSources: Set<taskUUID>;
  setFilterSources: Dispatch<SetStateAction<Set<taskUUID>>>;
  filterTargets: Set<taskUUID>;
  setFilterTargets: Dispatch<SetStateAction<Set<taskUUID>>>;
  filterMemo: string;
  setFilterMemo: Dispatch<SetStateAction<string>>;
  filteredTasks: Task[];
};

export function MainProvider({ children }: { children: React.ReactNode }) {
  const { tasks } = useContext(GlobalContext);
  const [mode, setMode] = useState(Mode.Normal);
  const [title, setTitle] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Status>(
    DefaultStatus.Pending
  );
  const [selectedAssignee, setSelectedAssignee] = useState<Assignee | null>(
    null
  );
  const [selectedSources, setSelectedSources] = useState<Set<taskUUID>>(
    new Set<taskUUID>([])
  );
  const [selectedTargets, setSelectedTargets] = useState<Set<taskUUID>>(
    new Set<taskUUID>([])
  );
  const [memo, setMemo] = useState("");

  const [filterTitle, setFilterTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<Assignee | null>(null);
  const [filterSources, setFilterSources] = useState<Set<taskUUID>>(
    new Set<taskUUID>([])
  );
  const [filterTargets, setFilterTargets] = useState<Set<taskUUID>>(
    new Set<taskUUID>([])
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
        selectedStatus,
        setSelectedStatus,
        selectedAssignee,
        setSelectedAssignee,
        selectedSources,
        setSelectedSources,
        selectedTargets,
        setSelectedTargets,
        memo,
        setMemo,

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
