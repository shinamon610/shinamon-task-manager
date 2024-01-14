import { DefaultStatus } from "@/models/status";
import {
  Task,
  UserInput,
  createTask,
  deleteSelectedTask,
  selectTask,
  unSelectAll,
  updateTaskStatus,
  updateTasks,
} from "@/models/task";
import { flatten } from "@/utils";
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
  FilterAssigneeSelecting,
  FilterAssigneeInputting,
  FilterSourcesSelecting,
  FilterSourcesInputting,
  FilterTargetsSelecting,
  FilterTargetsInputting,
  FilterMemoSelecting,
  FilterMemoInputting,
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
  [Mode.FilterStatusSelecting, Mode.FilterAssigneeSelecting],
  [Mode.FilterSourcesSelecting, Mode.FilterTargetsSelecting],
  [Mode.FilterMemoSelecting],
];
export const inputtingFilterModes = [
  [Mode.FilterTitleInputting],
  [Mode.FilterStatusInputting, Mode.FilterAssigneeInputting],
  [Mode.FilterSourcesInputting, Mode.FilterTargetsInputting],
  [Mode.FilterMemoInputting],
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
      const brankInput = {
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
      };
      const newTask = createTask(brankInput, userName, tasks);

      return [
        Mode.TitleInputting,
        updateTasks([...unSelectAll(tasks), newTask], brankInput, userName),
      ];
    case Command.DeleteTaskNode:
      return [Mode.Normal, deleteSelectedTask(tasks)];
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
    case Command.SelectFilterAssignee:
      return [Mode.FilterAssigneeSelecting, tasks];
    case Command.InputFilterAssignee:
      return [Mode.FilterAssigneeInputting, tasks];
    case Command.SelectFilterSources:
      return [Mode.FilterSourcesSelecting, tasks];
    case Command.InputFilterSources:
      return [Mode.FilterSourcesInputting, tasks];
    case Command.SelectFilterTargets:
      return [Mode.FilterTargetsSelecting, tasks];
    case Command.InputFilterTargets:
      return [Mode.FilterTargetsInputting, tasks];
    case Command.SelectFilterMemo:
      return [Mode.FilterMemoSelecting, tasks];
    case Command.InputFilterMemo:
      return [Mode.FilterMemoInputting, tasks];
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
