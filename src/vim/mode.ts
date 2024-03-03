import { selectLabelIndex } from "@/models/labels";
import { Task } from "@/models/task";
import { List } from "immutable";
import { Command } from "./commands";

export enum Mode {
  Normal,
  NodeSelecting,
  ViewSelecting,
  SpanSelecting,

  SideBarSelecting,

  // Markdown
  MarkDownViewing,
  MarkDownInputting,
  EditorSetting,

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

export const markdownModes = [
  Mode.MarkDownInputting,
  Mode.MarkDownViewing,
  Mode.EditorSetting,
];

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

export function createMode(
  mode: Mode,
  command: Command,
  filteredTasks: List<Task>,
  serialInput: string
): Mode {
  switch (command) {
    case Command.SelectSpan:
      return Mode.SpanSelecting;
    case Command.CreateTaskNode:
      return Mode.TitleInputting;
    case Command.DeleteTaskNode:
    case Command.Cancel:
    case Command.ConfirmEdit:
    case Command.ConfirmFilterEdit:
    case Command.Rename:
    case Command.ToGraph:
    case Command.ToTile:
    case Command.ToGantt:
    case Command.ToTimeLine:
    case Command.SpanHour:
    case Command.SpanDay:
    case Command.SpanWeek:
    case Command.SpanMonth:
    case Command.SpanYear:
      return Mode.Normal;
    case Command.SelectTitle:
      return Mode.TitleSelecting;
    case Command.InputTitle:
      return Mode.TitleInputting;
    case Command.SelectStatus:
      return Mode.StatusSelecting;
    case Command.InputStatus:
      return Mode.StatusInputting;
    case Command.SelectAssignee:
      return Mode.AssigneeSelecting;
    case Command.InputAssignee:
      return Mode.AssigneeInputting;
    case Command.SelectSources:
      return Mode.SourcesSelecting;
    case Command.InputSources:
      return Mode.SourcesInputting;
    case Command.SelectTargets:
      return Mode.TargetsSelecting;
    case Command.InputTargets:
      return Mode.TargetsInputting;
    case Command.SelectEstimatedTime:
      return Mode.EstimatedTimeSelecting;
    case Command.InputEstimatedTime:
      return Mode.EstimatedTimeInputting;
    case Command.SelectSpentTime:
      return Mode.SpentTimeSelecting;
    case Command.InputSpentTime:
      return Mode.SpentTimeInputting;
    case Command.SelectStartDateTime:
      return Mode.StartDateTimeSelecting;
    case Command.InputStartDateTime:
      return Mode.StartDateTimeInputting;
    case Command.SelectEndDateTime:
      return Mode.EndDateTimeSelecting;
    case Command.InputEndDateTime:
      return Mode.EndDateTimeInputting;
    case Command.SelectMemo:
      return Mode.MemoSelecting;
    case Command.InputMemo:
      return Mode.MemoInputting;
    case Command.SelectTaskNode:
      return selectLabelIndex(filteredTasks, serialInput) === null
        ? Mode.Normal
        : Mode.NodeSelecting;
    case Command.SelectView:
      return Mode.ViewSelecting;
    case Command.SelectAnotherLocation:
    case Command.SelectFilterTitle:
      return Mode.FilterTitleSelecting;
    case Command.InputFilterTitle:
      return Mode.FilterTitleInputting;
    case Command.SelectFilterStatus:
      return Mode.FilterStatusSelecting;
    case Command.InputFilterStatus:
      return Mode.FilterStatusInputting;
    case Command.SelectFilterAssignee:
      return Mode.FilterAssigneeSelecting;
    case Command.InputFilterAssignee:
      return Mode.FilterAssigneeInputting;
    case Command.SelectFilterSources:
      return Mode.FilterSourcesSelecting;
    case Command.InputFilterSources:
      return Mode.FilterSourcesInputting;
    case Command.SelectFilterTargets:
      return Mode.FilterTargetsSelecting;
    case Command.InputFilterTargets:
      return Mode.FilterTargetsInputting;
    case Command.SelectFilterMemo:
      return Mode.FilterMemoSelecting;
    case Command.InputFilterMemo:
      return Mode.FilterMemoInputting;
    case Command.SetToWorking:
      return Mode.NodeSelecting;
    case Command.SetToPending:
      return Mode.NodeSelecting;
    case Command.SetToDone:
      return Mode.NodeSelecting;
    case Command.ViewMarkdownFile:
      return Mode.MarkDownViewing;
    case Command.InputMarkdownFile:
      return Mode.MarkDownInputting;
    case Command.SetEditor:
      return Mode.EditorSetting;
    case Command.OpenEditor:
      return Mode.MarkDownViewing;
    case Command.OpenSideBar:
    case Command.SelectAbove:
    case Command.SelectBelow:
      return Mode.SideBarSelecting;
    case Command.CloseSideBar:
      return Mode.Normal;
    case Command.Nothing:
    case Command.Undo:
    case Command.Redo:
    case Command.ZoomIn:
    case Command.ZoomOut:
    case Command.PanLeft:
    case Command.PanRight:
    case Command.PanDown:
    case Command.PanUp:
      return mode;
  }
}

export function isFilter(mode: Mode): boolean {
  return [selectingFilterModes, inputtingFilterModes].some((modes) => {
    return modes.flat().includes(mode);
  });
}
