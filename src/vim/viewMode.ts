import { Command } from "./commands";
export enum ViewMode {
  Graph,
  Tile,
  Gantt,
  TimeLine,
}

export function createViewMode(command: Command, viewMode: ViewMode): ViewMode {
  switch (command) {
    case Command.ToGraph:
      return ViewMode.Graph;
    case Command.ToTile:
      return ViewMode.Tile;
    case Command.ToGantt:
    case Command.SelectSpan:
    case Command.SpanHour:
    case Command.SpanDay:
    case Command.SpanWeek:
    case Command.SpanMonth:
    case Command.SpanYear:
      return ViewMode.Gantt;
    case Command.ToTimeLine:
      return ViewMode.TimeLine;
    case Command.CreateTaskNode:
    case Command.DeleteTaskNode:
    case Command.SelectTaskNode:
    case Command.Cancel:
    case Command.ConfirmEdit:
    case Command.ConfirmFilterEdit:
    case Command.SetToWorking:
    case Command.SetToPending:
    case Command.SetToDone:
    case Command.ViewMarkdownFile:
    case Command.InputMarkdownFile:
    case Command.SetEditor:
    case Command.OpenEditor:
    case Command.SelectTitle:
    case Command.InputTitle:
    case Command.SelectStatus:
    case Command.InputStatus:
    case Command.SelectAssignee:
    case Command.InputAssignee:
    case Command.SelectSources:
    case Command.InputSources:
    case Command.SelectTargets:
    case Command.InputTargets:
    case Command.SelectEstimatedTime:
    case Command.InputEstimatedTime:
    case Command.SelectSpentTime:
    case Command.InputSpentTime:
    case Command.SelectStartDateTime:
    case Command.InputStartDateTime:
    case Command.SelectEndDateTime:
    case Command.InputEndDateTime:
    case Command.SelectMemo:
    case Command.InputMemo:
    case Command.SelectAnotherLocation:
    case Command.Rename:
    case Command.SelectFilterTitle:
    case Command.InputFilterTitle:
    case Command.SelectFilterStatus:
    case Command.InputFilterStatus:
    case Command.SelectFilterAssignee:
    case Command.InputFilterAssignee:
    case Command.SelectFilterSources:
    case Command.InputFilterSources:
    case Command.SelectFilterTargets:
    case Command.InputFilterTargets:
    case Command.SelectFilterMemo:
    case Command.InputFilterMemo:
    case Command.Nothing:
    case Command.Undo:
    case Command.Redo:
    case Command.SelectView:
    case Command.ZoomIn:
    case Command.ZoomOut:
    case Command.PanLeft:
      return viewMode;
  }
}
