import { UserInput, getSelectedTask } from "@/models/task";
import {
  updateTasks,
  unSelectAll,
  Task,
  createTask,
  selectTask,
} from "@/models/task";
import { Command } from "./commands";

export enum Mode {
  Normal,
  NodeSelecting,
  TitleSelecting,
  TitleInputting,
  StatusSelecting,
  StatusInputting,
  AssigneeSelecting,
  AssigneeInputting,
  SourcesSelecting,
  SourcesInputting,
  TargetsSelecting,
  TargetsInputting,
  EstimatedTimeSelecting,
  EstimatedTimeInputting,
  SpentTimeSelecting,
  SpentTimeInputting,
  StartDateTimeSelecting,
  StartDateTimeInputting,
  EndDateTimeSelecting,
  EndDateTimeInputting,
  MemoSelecting,
  MemoInputting,
  PurifyInputting,
}

export const selectingModes = [
  [Mode.TitleSelecting],
  [Mode.StatusSelecting, Mode.AssigneeSelecting],
  [Mode.SourcesSelecting, Mode.TargetsSelecting],
  [Mode.EstimatedTimeSelecting, Mode.SpentTimeSelecting],
  [Mode.StartDateTimeSelecting, Mode.EndDateTimeSelecting],
  [Mode.MemoSelecting],
];
export const inputtingModes = [
  [Mode.TitleInputting],
  [Mode.StatusInputting, Mode.AssigneeInputting],
  [Mode.SourcesInputting, Mode.TargetsInputting],
  [Mode.EstimatedTimeInputting, Mode.SpentTimeInputting],
  [Mode.StartDateTimeInputting, Mode.EndDateTimeInputting],
  [Mode.MemoInputting],
];

export function createModeAndTasks(
  mode: Mode,
  command: Command,
  tasks: Task[],
  serialInput: string,
  userInput: UserInput,
  filePath: string
): [Mode, Task[]] {
  switch (command) {
    case Command.CreateTaskNode:
      const newTask = createTask({
        name: "",
        startTime: null,
        endTime: null,
        estimatedTime: null,
        spentTime: null,
        to: [],
        from: [],
        priority: null,
        memo: null,
        status: null,
        assignee: null,
      });
      return [Mode.TitleSelecting, [...unSelectAll(tasks), newTask]];
    case Command.DeleteTaskNode:
      const idToDelete = getSelectedTask(tasks).id;
      return [
        Mode.Normal,
        tasks
          .filter((task): boolean => {
            return task.id !== idToDelete;
          })
          .map((task) => {
            return {
              ...task,
              to: [...task.to.filter((id) => id !== idToDelete)],
            };
          }),
      ];
    case Command.SelectTitle:
      return [Mode.TitleSelecting, tasks];
    case Command.InputTitle:
      return [Mode.TitleInputting, tasks];
    case Command.SelectStatus:
      return [Mode.StatusSelecting, tasks];
    case Command.InputStatus:
      return [Mode.StatusInputting, tasks];
    case Command.SelectAssignee:
      return [Mode.AssigneeSelecting, tasks];
    case Command.InputAssignee:
      return [Mode.AssigneeInputting, tasks];
    case Command.SelectSources:
      return [Mode.SourcesSelecting, tasks];
    case Command.InputSources:
      return [Mode.SourcesInputting, tasks];
    case Command.SelectTargets:
      return [Mode.TargetsSelecting, tasks];
    case Command.InputTargets:
      return [Mode.TargetsInputting, tasks];
    case Command.SelectEstimatedTime:
      return [Mode.EstimatedTimeSelecting, tasks];
    case Command.InputEstimatedTime:
      return [Mode.EstimatedTimeInputting, tasks];
    case Command.SelectSpentTime:
      return [Mode.SpentTimeSelecting, tasks];
    case Command.InputSpentTime:
      return [Mode.SpentTimeInputting, tasks];
    case Command.SelectStartDateTime:
      return [Mode.StartDateTimeSelecting, tasks];
    case Command.InputStartDateTime:
      return [Mode.StartDateTimeInputting, tasks];
    case Command.SelectEndDateTime:
      return [Mode.EndDateTimeSelecting, tasks];
    case Command.InputEndDateTime:
      return [Mode.EndDateTimeInputting, tasks];
    case Command.SelectMemo:
      return [Mode.MemoSelecting, tasks];
    case Command.InputMemo:
      return [Mode.MemoInputting, tasks];
    case Command.Fit:
      return [Mode.Normal, tasks];
    case Command.SelectTaskNode:
      const [newMode, newTasks] = selectTask(tasks, serialInput);
      return [newMode, newTasks];
    case Command.Nothing:
      return [mode, tasks];
    case Command.Cancel:
      return [Mode.Normal, unSelectAll(tasks)];
    case Command.Purify:
    case Command.ZoomIn:
    case Command.ZoomOut:
    case Command.PanLeft:
    case Command.PanDown:
    case Command.PanUp:
    case Command.PanRight:
      return [mode, tasks];
    case Command.ConfirmEdit:
      return [Mode.Normal, updateTasks(tasks, userInput)];
    case Command.SelectAnotherLocation:
      return [Mode.Normal, tasks];
  }
}
