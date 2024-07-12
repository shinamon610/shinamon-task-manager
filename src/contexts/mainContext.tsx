import { Assignee } from "@/models/assignee";
import { StatusLabel } from "@/models/status";
import { Mode } from "@/vim/mode";
import { ViewMode } from "@/vim/viewMode";
import { ViewMode as GanttViewMode } from "gantt-task-react";
import { List } from "immutable";
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
  selectedAssignee: null,
  setSelectedAssignee: () => {},
  selectedSources: new Set<UUID>([]),
  setSelectedSources: () => {},
  selectedTargets: new Set<UUID>([]),
  setSelectedTargets: () => {},
  memo: "",
  setMemo: () => {},

  filterTitle: "",
  setFilterTitle: () => {},
  filterStatusLabel: null,
  setFilterStatusLabel: () => {},
  filterAssignee: null,
  setFilterAssignee: () => {},
  filterSources: new Set<UUID>([]),
  setFilterSources: () => {},
  filterTargets: new Set<UUID>([]),
  setFilterTargets: () => {},
  filterMemo: "",
  setFilterMemo: () => {},
  filteredTasks: List([]),
  selectedStatusLabel: "Pending",
  setSelectedStatusLabel: () => {},

  viewMode: ViewMode.Graph,
  setViewMode: () => {},
  ganttViewMode: GanttViewMode.Day,
  setGanttViewMode: () => {},

  zoom: 1,
  setZoom: () => {},
});

type MainContextType = {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  selectedStatusLabel: StatusLabel;
  setSelectedStatusLabel: Dispatch<SetStateAction<StatusLabel>>;
  selectedAssignee: Assignee | null;
  setSelectedAssignee: Dispatch<SetStateAction<Assignee | null>>;
  selectedSources: Set<UUID>;
  setSelectedSources: Dispatch<SetStateAction<Set<UUID>>>;
  selectedTargets: Set<UUID>;
  setSelectedTargets: Dispatch<SetStateAction<Set<UUID>>>;
  memo: string;
  setMemo: Dispatch<SetStateAction<string>>;

  filterTitle: string;
  setFilterTitle: Dispatch<SetStateAction<string>>;
  filterStatusLabel: StatusLabel | null;
  setFilterStatusLabel: Dispatch<SetStateAction<StatusLabel | null>>;
  filterAssignee: Assignee | null;
  setFilterAssignee: Dispatch<SetStateAction<Assignee | null>>;
  filterSources: Set<UUID>;
  setFilterSources: Dispatch<SetStateAction<Set<UUID>>>;
  filterTargets: Set<UUID>;
  setFilterTargets: Dispatch<SetStateAction<Set<UUID>>>;
  filterMemo: string;
  setFilterMemo: Dispatch<SetStateAction<string>>;
  filteredTasks: List<Task>;
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  ganttViewMode: GanttViewMode;
  setGanttViewMode: Dispatch<SetStateAction<GanttViewMode>>;

  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
};

export function MainProvider({ children }: { children: React.ReactNode }) {
  const { tasks } = useContext(GlobalContext);
  const [viewMode, setViewMode] = useState(ViewMode.Graph);
  const [ganttViewMode, setGanttViewMode] = useState<GanttViewMode>(
    GanttViewMode.Day
  );
  const [mode, setMode] = useState(Mode.Normal);
  const [title, setTitle] = useState("");
  const [selectedStatusLabel, setSelectedStatusLabel] =
    useState<StatusLabel>("Pending");
  const [selectedAssignee, setSelectedAssignee] = useState<Assignee | null>(
    null
  );
  const [selectedSources, setSelectedSources] = useState<Set<UUID>>(
    new Set<UUID>([])
  );
  const [selectedTargets, setSelectedTargets] = useState<Set<UUID>>(
    new Set<UUID>([])
  );
  const [memo, setMemo] = useState("");

  const [filterTitle, setFilterTitle] = useState("");
  const [filterStatusLabel, setFilterStatusLabel] =
    useState<StatusLabel | null>(null);
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
      filterStatusLabel,
      filterAssignee,
      filterSources,
      filterTargets,
      filterMemo
    );
  }, [
    tasks,
    filterTitle,
    filterStatusLabel,
    filterAssignee,
    filterSources,
    filterTargets,
    filterMemo,
  ]);

  const [zoom, setZoom] = useState(1);
  return (
    <MainContext.Provider
      value={{
        mode,
        setMode,
        title,
        setTitle,
        selectedStatusLabel,
        setSelectedStatusLabel,
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
        filterStatusLabel,
        setFilterStatusLabel,
        filterAssignee,
        setFilterAssignee,
        filterSources,
        setFilterSources,
        filterTargets,
        setFilterTargets,
        filterMemo,
        setFilterMemo,
        filteredTasks,

        viewMode,
        setViewMode,
        ganttViewMode,
        setGanttViewMode,

        zoom,
        setZoom,
      }}
    >
      {children}
    </MainContext.Provider>
  );
}
