import { DefaultStatus } from "@/models/status";
import { flatten } from "@/utils";
import { UserInput, getSelectedTask } from "@/models/task";
import {
  updateTaskStatus,
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

  //edit
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

  // filter
  FilterTitleSelecting,
  FilterTitleInputting,
  FilterStatusSelecting,
  FilterStatusInputting,
}

export const selectingModes = [
  [Mode.TitleSelecting],
  [Mode.StatusSelecting, Mode.AssigneeSelecting],
  [Mode.SourcesSelecting, Mode.TargetsSelecting],
  [
    Mode.StartDateTimeSelecting,
    Mode.EndDateTimeSelecting,
    Mode.EstimatedTimeSelecting,
    Mode.SpentTimeSelecting,
  ],
  [Mode.MemoSelecting],
];
export const inputtingModes = [
  [Mode.TitleInputting],
  [Mode.StatusInputting, Mode.AssigneeInputting],
  [Mode.SourcesInputting, Mode.TargetsInputting],
  [
    Mode.StartDateTimeInputting,
    Mode.EndDateTimeInputting,
    Mode.EstimatedTimeInputting,
    Mode.SpentTimeInputting,
  ],
  [Mode.MemoInputting],
];

export const selectingFilterModes = [
  [Mode.FilterTitleSelecting],
  [Mode.FilterStatusSelecting],
];
export const inputtingFilterModes = [
  [Mode.FilterTitleInputting],
  [Mode.FilterStatusInputting],
];

export function createModeAndTasks(
  mode: Mode,
  command: Command,
  tasks: Task[],
  filteredTasks: Task[],
  serialInput: string,
  userInput: UserInput,
  userName: string
): [Mode, Task[]] {
  switch (command) {
    case Command.CreateTaskNode:
      const newTask = createTask(
        {
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
        },
        userName,
        tasks
      );
      return [Mode.TitleInputting, [...unSelectAll(tasks), newTask]];
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
    case Command.SelectTaskNode:
      const [newMode, newTasks] = selectTask(tasks, filteredTasks, serialInput);
      return [newMode, newTasks];
    case Command.Nothing:
      return [mode, tasks];
    case Command.Cancel:
      return [Mode.Normal, unSelectAll(tasks)];
    case Command.ConfirmEdit:
      return [Mode.Normal, updateTasks(tasks, userInput, userName)];
    case Command.SelectAnotherLocation:
    case Command.Rename:
      return [Mode.Normal, tasks];
    case Command.Filter:
      return [Mode.FilterTitleSelecting, tasks];
    case Command.SelectFilterTitle:
      return [Mode.FilterTitleSelecting, tasks];
    case Command.InputFilterTitle:
      return [Mode.FilterTitleInputting, tasks];
    case Command.SelectFilterStatus:
      return [Mode.FilterStatusSelecting, tasks];
    case Command.InputFilterStatus:
      return [Mode.FilterStatusInputting, tasks];
    case Command.SetToWorking:
      return [
        Mode.NodeSelecting,
        updateTaskStatus(tasks, DefaultStatus.Working, userName),
      ];
    case Command.SetToPending:
      return [
        Mode.NodeSelecting,
        updateTaskStatus(tasks, DefaultStatus.Pending, userName),
      ];
    case Command.SetToDone:
      return [
        Mode.NodeSelecting,
        updateTaskStatus(tasks, DefaultStatus.Done, userName),
      ];
  }
}

export function isFilter(mode: Mode): boolean {
  return [selectingFilterModes, inputtingFilterModes].some((modes) => {
    return flatten(modes).includes(mode);
  });
}
