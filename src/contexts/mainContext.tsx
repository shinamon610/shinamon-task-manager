import { Assignee } from "@/models/assignee";
import { Status } from "@/models/status";
import { Mode } from "@/vim/mode";
import { Dispatch, SetStateAction, createContext, useState } from "react";
import { UUID } from "../models/task";

export const MainContext = createContext<MainContextType>({
  mode: Mode.Normal,
  setMode: () => {},
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
});

type MainContextType = {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
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
};

export function MainProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState(Mode.Normal);
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
  return (
    <MainContext.Provider
      value={{
        mode,
        setMode,
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
      }}
    >
      {children}
    </MainContext.Provider>
  );
}
