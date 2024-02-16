import { EditBar } from "@/components/editBar";
import { EditorSettingTextBox } from "@/components/editorSettingTextBox";
import { FlexContainer } from "@/components/flexContainer";
import { KeyBar } from "@/components/keyBar";
import MarkdownViewer from "@/components/markdownViewer";
import TaskGraph from "@/components/taskGraph";
import { Assignee } from "@/models/assignee";
import { saveData } from "@/models/file";
import {
  DefaultStatus,
  Status,
  loadInitialAllStatus,
  loadInitialStatus,
} from "@/models/status";
import { Command, keyEventToCommand } from "@/vim/commands";
import { createSerialInput } from "@/vim/createSerialInput";
import { Mode, createModeAndTasks, isFilter, markdownModes } from "@/vim/mode";
import { preventKey } from "@/vim/preventKey";
import { ViewMode, createViewMode } from "@/vim/viewMode";
import moment, { Moment } from "moment";
import React, { useEffect, useRef, useState } from "react";
import { Task, UUID, filterTasks, getSelectedTask } from "../models/task";
type MainPageProps = {
  filePath: string;
  setFilePath: React.Dispatch<React.SetStateAction<string>>;
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  assignees: Set<Assignee>;
  setAssignees: React.Dispatch<React.SetStateAction<Set<Assignee>>>;
};

export function MainPage({
  filePath,
  setFilePath,
  userName,
  setUserName,
  tasks,
  setTasks,
  assignees,
  setAssignees,
}: MainPageProps) {
  const [statuses, setStatuses] = useState(loadInitialStatus());
  const [allStatuses, setAllStatuses] = useState(loadInitialAllStatus());
  const [mode, setMode] = useState(Mode.Normal);
  const [viewMode, setViewMode] = useState(ViewMode.Graph);
  const [serialInput, setSerialInput] = useState("");
  const [command, setCommand] = useState(Command.Nothing);

  // edit barの要素
  const [title, setTitle] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Status>(
    DefaultStatus.Pending
  );
  const [selectedAssignee, setSelectedAssignee] = useState<Assignee | null>(
    null
  );
  const [selectedSources, setSelectedSources] = useState<Set<UUID>>(
    new Set<UUID>([])
  );
  const sourcesRef = useRef(null);
  const [selectedTargets, setSelectedTargets] = useState<Set<UUID>>(
    new Set<UUID>([])
  );
  const targetsRef = useRef(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [spentTime, setSpentTime] = useState<number>(0);
  const [startDateTime, setStartDateTime] = useState<Moment | null>(null);
  const [endDateTime, setEndDateTime] = useState<Moment | null>(null);
  const [memo, setMemo] = useState("");

  // filter設定
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

  // editor
  const [editor, setEditor] = useState("");

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const newCommand = keyEventToCommand(mode, event, sourcesRef, targetsRef);
      preventKey(event, newCommand);

      const filteredTasks = filterTasks(
        tasks,
        filterTitle,
        filterStatus,
        filterAssignee,
        filterSources,
        filterTargets,
        filterMemo
      );
      const newSerialInput = createSerialInput(
        event.key,
        newCommand,
        serialInput,
        filteredTasks
      );
      const [newMode, newTasks] = createModeAndTasks(
        mode,
        newCommand,
        tasks,
        filteredTasks,
        newSerialInput,
        {
          name: title,
          startTime: startDateTime,
          endTime: endDateTime,
          estimatedTime: estimatedTime,
          spentTime: spentTime,
          to: Array.from(selectedTargets),
          from: Array.from(selectedSources),
          priority: null,
          memo: memo,
          status: selectedStatus,
          assignee: selectedAssignee,
        },
        userName
      );
      const newViewMode = createViewMode(newCommand, viewMode);
      setCommand(newCommand);
      setMode(newMode);
      setViewMode(newViewMode);
      setTasks(newTasks);
      setSerialInput(newSerialInput);
      if (
        newMode === Mode.NodeSelecting ||
        newCommand === Command.CreateTaskNode
      ) {
        const selectedTask = getSelectedTask(newTasks)!;
        setTitle(
          newCommand === Command.CreateTaskNode ? "" : selectedTask.name
        );
        setSelectedStatus(selectedTask.status);
        setSelectedAssignee(selectedTask.assignee);
        setSelectedSources(new Set<UUID>(selectedTask.from));
        setSelectedTargets(new Set<UUID>(selectedTask.to));
        setEstimatedTime(selectedTask.estimatedTime);
        setSpentTime(selectedTask.spentTime);
        setStartDateTime(selectedTask.startTime);
        setEndDateTime(selectedTask.endTime);
        setMemo(selectedTask.memo);
      }
      if (newCommand === Command.SelectAnotherLocation) {
        setFilePath("");
      }
      if (newCommand === Command.InputStartDateTime) {
        if (startDateTime === null) {
          setStartDateTime(moment());
        }
      }
      if (newCommand === Command.InputEndDateTime) {
        if (endDateTime === null) {
          setEndDateTime(moment());
        }
      }
      if (newCommand === Command.Rename) {
        setUserName("");
      }

      console.log("memo", memo);
      saveData({ tasks: newTasks, userName }, filePath);
    };
    window.addEventListener("keydown", handle);
    return () => {
      window.removeEventListener("keydown", handle);
    };
  });

  return (
    <div className={"homepage"}>
      {markdownModes.includes(mode) ? (
        <>
          <MarkdownViewer memo={memo} setMemo={setMemo} mode={mode} />
          <FlexContainer
            components={[
              <KeyBar key={"m0"} mode={mode} tasks={tasks} />,
              <label key={"m1"} style={{ backgroundColor: "var(--active)" }}>
                Editor:
              </label>,
              <EditorSettingTextBox
                key={"m2"}
                editor={editor}
                setEditor={setEditor}
                mode={mode}
              />,
            ]}
            isSelected={false}
            ratios={[1, 0, 1]}
          />
        </>
      ) : (
        <>
          <TaskGraph
            tasks={filterTasks(
              tasks,
              filterTitle,
              filterStatus,
              filterAssignee,
              filterSources,
              filterTargets,
              filterMemo
            )}
            assignees={assignees}
            serialInput={serialInput}
            mode={mode}
            viewMode={viewMode}
            command={command}
          />
          <KeyBar mode={mode} tasks={tasks} />
          <EditBar
            mode={mode}
            tasks={tasks}
            title={isFilter(mode) ? filterTitle : title}
            setTitle={isFilter(mode) ? setFilterTitle : setTitle}
            selectedStatus={isFilter(mode) ? filterStatus : selectedStatus}
            setSelectedStatus={
              isFilter(mode) ? setFilterStatus : setSelectedStatus
            }
            statuses={isFilter(mode) ? allStatuses : statuses}
            setStatuses={isFilter(mode) ? setAllStatuses : setStatuses}
            selectedAssignee={
              isFilter(mode) ? filterAssignee : selectedAssignee
            }
            setSelectedAssignee={
              isFilter(mode) ? setFilterAssignee : setSelectedAssignee
            }
            assignees={assignees}
            setAssignees={setAssignees}
            selectedSources={isFilter(mode) ? filterSources : selectedSources}
            setSelectedSources={
              isFilter(mode) ? setFilterSources : setSelectedSources
            }
            sourcesRef={sourcesRef}
            selectedTargets={isFilter(mode) ? filterTargets : selectedTargets}
            setSelectedTargets={
              isFilter(mode) ? setFilterTargets : setSelectedTargets
            }
            targetsRef={targetsRef}
            estimatedTime={estimatedTime}
            setEstimatedTime={setEstimatedTime}
            spentTime={spentTime}
            setSpentTime={setSpentTime}
            startDateTime={startDateTime}
            setStartDateTime={setStartDateTime}
            endDateTime={endDateTime}
            setEndDateTime={setEndDateTime}
            memo={isFilter(mode) ? filterMemo : memo}
            setMemo={isFilter(mode) ? setFilterMemo : setMemo}
          />
        </>
      )}
    </div>
  );
}
