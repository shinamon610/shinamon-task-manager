import { GlobalContext } from "@/contexts/globalContext";
import { MainContext } from "@/contexts/mainContext";
import { load, saveData } from "@/models/file";
import { toStatus } from "@/models/status";
import {
  Task,
  UUID,
  createTasks,
  filterTasks,
  getSelectedTask,
  noneId,
} from "@/models/task";
import { Command, keyEventToCommand, panCommands } from "@/vim/commands";
import { createSerialInput } from "@/vim/createSerialInput";
import { Mode, createMode, markdownModes } from "@/vim/mode";
import { preventKey } from "@/vim/preventKey";
import { createViewMode } from "@/vim/viewMode";
import { ViewMode as GanttViewMode } from "gantt-task-react";
import { List } from "immutable";
import moment, { Moment } from "moment";
import { useContext, useEffect, useRef, useState } from "react";
import { MarkdownPage } from "./markdownPage";
import { TaskPage } from "./taskPage";

export function MainPage() {
  const {
    setDirPath,
    userName,
    filePath,
    archivePath,
    setUserName,
    tasks,
    stackedTasks,
    pushHistory,
    setHistories,
    prevHistory,
    nextHistory,
    swappable,
  } = useContext(GlobalContext);
  const {
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
    filteredTasks,
    viewMode,
    setViewMode,
    setGanttViewMode,
    filterSources,
    setFilterSources,
    filterTargets,
    setFilterTargets,
    filterStatusLabel,
  } = useContext(MainContext);
  const [serialInput, setSerialInput] = useState("");
  const [command, setCommand] = useState(Command.Nothing);
  const [refresh, setRefresh] = useState(false);
  const [isCreatingNewTask, setIsCreatingNewTask] = useState(false);

  // edit barの要素
  const sourcesRef = useRef(null);
  const targetsRef = useRef(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [spentTime, setSpentTime] = useState<number>(0);
  const [startDateTime, setStartDateTime] = useState<Moment | null>(null);
  const [endDateTime, setEndDateTime] = useState<Moment | null>(null);

  // editor
  const [editor, setEditor] = useState("");

  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  function setTaskData(newCommand: Command, newTasks: List<Task>) {
    const selectedTask = getSelectedTask(newTasks)!;
    setTitle(newCommand === Command.CreateTaskNode ? "" : selectedTask.name);
    setSelectedStatusLabel(selectedTask.status.type);
    setSelectedAssignee(selectedTask.assignee);
    setSelectedSources(new Set<UUID>(selectedTask.from));
    setSelectedTargets(new Set<UUID>(selectedTask.to));
    setEstimatedTime(selectedTask.estimatedTime);
    setSpentTime(selectedTask.spentTime);
    setStartDateTime(selectedTask.startTime);
    setEndDateTime(selectedTask.endTime);
    setMemo(selectedTask.memo);
  }

  const mergeTasks = (
    dumpedTasks: List<Task>,
    newTasks: List<Task>
  ): List<Task> => {
    const unmergedDumpedTasks = dumpedTasks.filter(
      (dtask) => !newTasks.map((t) => t.id).contains(dtask.id)
    );
    const mergedTasks = newTasks.concat(unmergedDumpedTasks);
    return mergedTasks;
  };

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const newCommand = keyEventToCommand(
        mode,
        viewMode,
        event,
        sourcesRef,
        targetsRef,
        swappable,
        filterStatusLabel
      );
      preventKey(event, newCommand);

      const newSerialInput = createSerialInput(
        event.key,
        newCommand,
        serialInput,
        filteredTasks
      );
      const [newMode, newViewMode, maybeNewTasks] = [
        createMode(mode, newCommand, filteredTasks, newSerialInput),
        createViewMode(newCommand, viewMode),
        createTasks(
          newCommand,
          tasks,
          filteredTasks,
          stackedTasks,
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
            status: toStatus(selectedStatusLabel),
            assignee: selectedAssignee,
          },
          userName,
          {
            name: "",
            startTime: null,
            endTime: null,
            estimatedTime: null,
            spentTime: null,
            to: Array.from(filterTargets).filter((id) => id !== noneId),
            from: Array.from(filterSources).filter((id) => id !== noneId),
            priority: null,
            memo: null,
            status: null,
            assignee: null,
          },
          isCreatingNewTask
        ),
      ];

      setCommand(newCommand);
      setMode(newMode);
      setViewMode(newViewMode);
      setSerialInput(newSerialInput);

      if (
        newCommand === Command.OpenSideBar ||
        newCommand === Command.CloseSideBar
      ) {
        setIsSideBarOpen(newCommand === Command.OpenSideBar);
      }
      if (newCommand === Command.Undo) {
        prevHistory();
      }

      if (newCommand === Command.Redo) {
        nextHistory();
      }
      if (newCommand === Command.SelectAnotherLocation) {
        setDirPath("");
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
      if (newCommand === Command.SpanHour) {
        setGanttViewMode(GanttViewMode.Hour);
      }
      if (newCommand === Command.SpanDay) {
        setGanttViewMode(GanttViewMode.Day);
      }
      if (newCommand === Command.SpanWeek) {
        setGanttViewMode(GanttViewMode.Week);
      }
      if (newCommand === Command.SpanMonth) {
        setGanttViewMode(GanttViewMode.Month);
      }
      if (newCommand === Command.SpanYear) {
        setGanttViewMode(GanttViewMode.Year);
      }
      if (
        newCommand === Command.ZoomIn ||
        newCommand === Command.ZoomOut ||
        panCommands.includes(newCommand)
      ) {
        setRefresh(!refresh);
      }
      if (newCommand === Command.CreateTaskNode) {
        setIsCreatingNewTask(true);
      }
      if (newCommand === Command.ConfirmEdit || newCommand === Command.Cancel) {
        setIsCreatingNewTask(false);
      }
      if (newCommand === Command.ShowSources) {
        setFilterTargets(new Set([getSelectedTask(tasks)!.id]));
      }
      if (newCommand === Command.ShowTargets) {
        setFilterSources(new Set([getSelectedTask(tasks)!.id]));
      }

      // 新しいtaskが存在するとき
      if (maybeNewTasks === null) {
        return;
      }
      const newTasks = maybeNewTasks;

      if (newCommand === Command.DumpArchive) {
        // dumpする前に、全てのdumpを取得しておかないと以前のdumpが消えてしまう。
        const f = (dumpedTasks: List<Task>) => {
          const mergedTasks = mergeTasks(dumpedTasks, newTasks);
          const newDumpTasks = filterTasks(
            mergedTasks,
            "",
            "Done",
            "",
            new Set([]),
            new Set([]),
            "",
            null,
            null
          );
          const restTasks = filterTasks(
            mergedTasks,
            "",
            "Not Done",
            "",
            new Set([]),
            new Set([]),
            "",
            null,
            null
          );
          saveData({ tasks: newDumpTasks, userName }, archivePath);
          setHistories(List([restTasks]));
          saveData({ tasks: restTasks, userName }, filePath);
        };
        load(archivePath)
          .then((data) => {
            f(data.tasks);
          })
          .catch(() => {
            f(List([]));
          });
      }

      if (newCommand === Command.ReadArchive) {
        load(archivePath).then((data) => {
          const mergedTasks = mergeTasks(data.tasks, newTasks);
          saveData({ tasks: mergedTasks, userName }, filePath);
          pushHistory(mergedTasks);
        });
      }

      if (
        newCommand === Command.CreateTaskNode ||
        newCommand === Command.DeleteTaskNode ||
        newCommand === Command.SelectTaskNode ||
        newCommand === Command.OpenSideBar ||
        newCommand === Command.SelectAbove ||
        newCommand === Command.SelectBelow ||
        newCommand === Command.SwapAbove ||
        newCommand === Command.SwapBelow ||
        newCommand === Command.Cancel ||
        newCommand === Command.ConfirmFilterEdit ||
        newCommand === Command.ConfirmEdit ||
        newCommand === Command.SetToWorking ||
        newCommand === Command.SetToPending ||
        newCommand === Command.SetToDone
      ) {
        pushHistory(newTasks);
        saveData({ tasks, userName }, filePath);
      }

      if (
        newMode === Mode.NodeSelecting ||
        newMode === Mode.SideBarSelecting ||
        newCommand === Command.CreateTaskNode
      ) {
        setTaskData(newCommand, newTasks);
      }
    };
    window.addEventListener("keydown", handle);
    return () => {
      window.removeEventListener("keydown", handle);
    };
  });

  return (
    <div className="homepage">
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
          refresh={refresh}
          isSideBarOpen={isSideBarOpen}
        />
      )}
    </div>
  );
}
