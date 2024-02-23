import { GlobalContext } from "@/contexts/globalContext";
import { MainContext } from "@/contexts/mainContext";
import { saveData } from "@/models/file";
import { Command, keyEventToCommand } from "@/vim/commands";
import { createSerialInput } from "@/vim/createSerialInput";
import { Mode, createModeAndTasks, markdownModes } from "@/vim/mode";
import { preventKey } from "@/vim/preventKey";
import { ViewMode, createViewMode } from "@/vim/viewMode";
import moment, { Moment } from "moment";
import { useContext, useEffect, useRef, useState } from "react";
import { getSelectedTask, taskUUID } from "../models/task";
import { MarkdownPage } from "./markdownPage";
import { TaskPage } from "./taskPage";

export function MainPage() {
  const { filePath, setFilePath, userName, setUserName, tasks, setTasks } =
    useContext(GlobalContext);
  const {
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
    filteredTasks,
  } = useContext(MainContext);
  const [viewMode, setViewMode] = useState(ViewMode.Graph);
  const [serialInput, setSerialInput] = useState("");
  const [command, setCommand] = useState(Command.Nothing);

  // edit barの要素
  const sourcesRef = useRef(null);
  const targetsRef = useRef(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [spentTime, setSpentTime] = useState<number>(0);
  const [startDateTime, setStartDateTime] = useState<Moment | null>(null);
  const [endDateTime, setEndDateTime] = useState<Moment | null>(null);

  // editor
  const [editor, setEditor] = useState("");

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const newCommand = keyEventToCommand(mode, event, sourcesRef, targetsRef);
      preventKey(event, newCommand);

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
        setSelectedSources(new Set<taskUUID>(selectedTask.from));
        setSelectedTargets(new Set<taskUUID>(selectedTask.to));
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
        <MarkdownPage editor={editor} setEditor={setEditor} />
      ) : (
        <TaskPage
          serialInput={serialInput}
          viewMode={viewMode}
          command={command}
          sourcesRef={sourcesRef}
          targetsRef={targetsRef}
          estimatedTime={estimatedTime}
          setEstimatedTime={setEstimatedTime}
          spentTime={spentTime}
          setSpentTime={setSpentTime}
          startDateTime={startDateTime}
          setStartDateTime={setStartDateTime}
          endDateTime={endDateTime}
          setEndDateTime={setEndDateTime}
        />
      )}
    </div>
  );
}
