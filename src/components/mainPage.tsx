import { BottomBar } from "./bottombar";
import { extractAssignees } from "@/models/assignee";
import { Task } from "../models/task";
import { saveData } from "@/models/file";
import { selectThenSaveFilePath } from "@/models/file";
import { keyEventToCommand } from "@/vim/commands";
import React, { useRef, useState, useEffect } from "react";
import { getSelectedTask } from "../models/task";
import { loadInitialStatusOptions } from "@/models/status";
import { Mode, createModeAndTasks } from "@/vim/mode";
import TaskGraph from "@/components/taskGraph";
import { Command } from "@/vim/commands";
import { EditBar } from "@/components/editBar";
import { preventKey } from "@/vim/preventKey";
import { createSerialInput } from "@/vim/createSerialInput";
import { UUID } from "../models/task";
import { Option } from "@/components/selectBox";
import moment, { Moment } from "moment";
import { Status } from "@/models/status";
import { Assignee } from "@/models/assignee";
import { loadData } from "@/models/file";

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
  const [statuses, setStatuses] = useState(loadInitialStatusOptions());
  const [mode, setMode] = useState(Mode.Normal);
  const [serialInput, setSerialInput] = useState("");
  const [command, setCommand] = useState(Command.Nothing);

  // edit barの要素
  const [title, setTitle] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Option<Status>>({
    value: Status.Pending,
    label: "",
  });
  const [selectedAssignee, setSelectedAssignee] = useState<Assignee | null>(
    null
  );
  const [selectedSources, setSelectedSources] = useState<Set<Option<UUID>>>(
    new Set<Option<UUID>>([])
  );
  const sourcesRef = useRef(null);
  const [selectedTargets, setSelectedTargets] = useState<Set<Option<UUID>>>(
    new Set<Option<UUID>>([])
  );
  const targetsRef = useRef(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [spentTime, setSpentTime] = useState<number>(0);
  const [startDateTime, setStartDateTime] = useState<Moment | null>(null);
  const [endDateTime, setEndDateTime] = useState<Moment | null>(null);
  const [memo, setMemo] = useState("");

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const newCommand = keyEventToCommand(mode, event, sourcesRef, targetsRef);
      preventKey(event, newCommand);
      const newSerialInput = createSerialInput(
        event.key,
        newCommand,
        serialInput,
        tasks
      );
      const [newMode, newTasks] = createModeAndTasks(
        mode,
        newCommand,
        tasks,
        newSerialInput,
        {
          name: title,
          startTime: startDateTime,
          endTime: endDateTime,
          estimatedTime: estimatedTime,
          spentTime: spentTime,
          to: Array.from(selectedTargets).map(({ value }) => value),
          from: Array.from(selectedSources).map(({ value }) => value),
          priority: null,
          memo: memo,
          status: selectedStatus.value,
          assignee: selectedAssignee,
        },
        userName
      );
      setCommand(newCommand);
      setMode(newMode);
      setTasks(newTasks);
      setSerialInput(newSerialInput);
      if (
        newMode === Mode.NodeSelecting ||
        newCommand === Command.CreateTaskNode
      ) {
        const selectedTask = getSelectedTask(newTasks);
        setTitle(selectedTask.name);
        setSelectedStatus({
          value: selectedTask.status,
          label: selectedTask.status.toString(),
        });
        setSelectedAssignee(selectedTask.assignee);
        setSelectedSources(
          new Set<Option<UUID>>(
            newTasks
              .filter((task) => task.to.includes(selectedTask.id))
              .map((task) => ({ value: task.id, label: task.name }))
          )
        );

        setSelectedTargets(
          new Set<Option<UUID>>(
            getSelectedTask(newTasks).to.map((id) => {
              const task = newTasks.find((task) => task.id === id)!;
              return {
                value: task.id,
                label: task.name,
              };
            })
          )
        );
        setEstimatedTime(selectedTask.estimatedTime);
        setSpentTime(selectedTask.spentTime);
        setStartDateTime(selectedTask.startTime);
        setEndDateTime(selectedTask.endTime);
        setMemo(selectedTask.memo);
      }
      if (newCommand === Command.SelectAnotherLocation) {
        selectThenSaveFilePath().then((newFilePath) => {
          if (newFilePath === null) {
            return;
          }
          setFilePath(newFilePath);
        });
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
      <TaskGraph
        tasks={tasks}
        assignees={assignees}
        serialInput={serialInput}
        mode={mode}
        command={command}
      />
      <BottomBar mode={mode} />
      <EditBar
        mode={mode}
        tasks={tasks}
        title={title}
        setTitle={setTitle}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        statuses={statuses}
        setStatuses={setStatuses}
        selectedAssignee={selectedAssignee}
        setSelectedAssignee={setSelectedAssignee}
        assignees={assignees}
        setAssignees={setAssignees}
        selectedSources={selectedSources}
        setSelectedSources={setSelectedSources}
        sourcesRef={sourcesRef}
        selectedTargets={selectedTargets}
        setSelectedTargets={setSelectedTargets}
        targetsRef={targetsRef}
        estimatedTime={estimatedTime}
        setEstimatedTime={setEstimatedTime}
        spentTime={spentTime}
        setSpentTime={setSpentTime}
        startDateTime={startDateTime}
        setStartDateTime={setStartDateTime}
        endDateTime={endDateTime}
        setEndDateTime={setEndDateTime}
        memo={memo}
        setMemo={setMemo}
      />
    </div>
  );
}
