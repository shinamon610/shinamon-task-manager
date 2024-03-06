import { getCircularIndex, getNextItem, getPrevItem } from "@/utils";
import { MutableRefObject } from "react";
import {
  Mode,
  inputtingFilterModes,
  inputtingModes,
  isFilter,
  selectingFilterModes,
  selectingModes,
} from "./mode";
import { ViewMode } from "./viewMode";

export enum Command {
  CreateTaskNode,
  DeleteTaskNode,
  SelectTaskNode,
  Nothing,
  Cancel,
  ConfirmEdit,
  ConfirmFilterEdit,
  SelectAnotherLocation,
  Rename,
  SetToWorking,
  SetToPending,
  SetToDone,
  Undo,
  Redo,
  SelectView,

  OpenSideBar,
  CloseSideBar,
  SelectAbove,
  SelectBelow,
  SwapAbove,
  SwapBelow,

  // zoomとpan
  ZoomIn,
  ZoomOut,
  PanLeft,
  PanRight,
  PanDown,
  PanUp,

  // gantt
  SelectSpan,
  SpanHour,
  SpanDay,
  SpanWeek,
  SpanMonth,
  SpanYear,

  // Markdown
  ViewMarkdownFile,
  InputMarkdownFile,
  OpenEditor,
  SetEditor,

  //edit
  SelectTitle,
  InputTitle,
  SelectStatus,
  InputStatus,
  SelectAssignee,
  InputAssignee,
  SelectSources,
  InputSources,
  SelectTargets,
  InputTargets,
  SelectEstimatedTime,
  InputEstimatedTime,
  SelectSpentTime,
  InputSpentTime,
  SelectStartDateTime,
  InputStartDateTime,
  SelectEndDateTime,
  InputEndDateTime,
  SelectMemo,
  InputMemo,

  // filter
  SelectFilterTitle,
  InputFilterTitle,
  SelectFilterStatus,
  InputFilterStatus,
  SelectFilterAssignee,
  InputFilterAssignee,
  SelectFilterSources,
  InputFilterSources,
  SelectFilterTargets,
  InputFilterTargets,
  SelectFilterMemo,
  InputFilterMemo,

  // ViewMode
  ToGraph,
  ToTile,
  ToGantt,
  ToTimeLine,
}

export const selectString = "ahik";
export const leftStrings = ["ArrowLeft", "h"];
export const downStrings = ["ArrowDown", "j"];
export const upStrings = ["ArrowUp", "k"];
export const rightStrings = ["ArrowRight", "l"];

const selectingCommands = [
  [Command.SelectTitle],
  [Command.SelectStatus, Command.SelectAssignee],
  [Command.SelectSources, Command.SelectTargets],
  [
    Command.SelectStartDateTime,
    Command.SelectEndDateTime,
    Command.SelectEstimatedTime,
    Command.SelectSpentTime,
  ],
  [Command.SelectMemo],
];
const inputtingCommands = [
  [Command.InputTitle],
  [Command.InputStatus, Command.InputAssignee],
  [Command.InputSources, Command.InputTargets],
  [
    Command.InputStartDateTime,
    Command.InputEndDateTime,
    Command.InputEstimatedTime,
    Command.InputSpentTime,
  ],
  [Command.InputMemo],
];

const selectingFilterCommands = [
  [Command.SelectFilterTitle],
  [Command.SelectFilterStatus, Command.SelectFilterAssignee],
  [Command.SelectFilterSources, Command.SelectFilterTargets],
  [Command.SelectFilterMemo],
];
const inputtingFilterCommands = [
  [Command.InputFilterTitle],
  [Command.InputFilterStatus, Command.InputFilterAssignee],
  [Command.InputFilterSources, Command.InputFilterTargets],
  [Command.InputFilterMemo],
];

export const panCommands = [
  Command.PanLeft,
  Command.PanRight,
  Command.PanDown,
  Command.PanUp,
];
function handleSelectMode(
  mode: Mode,
  event: KeyboardEvent,
  selectingModes: Mode[][],
  selectingCommands: Command[][],
  inputtingCommands: Command[][]
): Command {
  const key = event.key;
  const ix = selectingModes.findIndex((modes) => {
    return modes.includes(mode);
  });
  if (ix === -1) {
    return Command.Nothing;
  }
  if (key === "Escape" || key == "c" || key == "Backspace") {
    return isFilter(mode) ? Command.ConfirmFilterEdit : Command.Cancel;
  }
  const iy = selectingModes[ix].indexOf(mode);
  if (key === "Enter") {
    if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
      return isFilter(mode) ? Command.ConfirmFilterEdit : Command.ConfirmEdit;
    }
    return inputtingCommands[ix][iy];
  }
  if (downStrings.includes(key)) {
    const nextIx = getCircularIndex(ix, selectingCommands.length, 1);
    return selectingCommands[nextIx][iy % selectingCommands[nextIx].length];
  }
  if (upStrings.includes(key)) {
    const nextIx = getCircularIndex(ix, selectingCommands.length, -1);
    return selectingCommands[nextIx][iy % selectingCommands[nextIx].length];
  }
  if (rightStrings.includes(key)) {
    return selectingCommands[ix][
      getCircularIndex(iy, selectingCommands[ix].length, 1)
    ];
  }
  if (leftStrings.includes(key)) {
    return selectingCommands[ix][
      getCircularIndex(iy, selectingCommands[ix].length, -1)
    ];
  }
  return Command.Nothing;
}

function handleInputMode(
  mode: Mode,
  event: KeyboardEvent,
  sourcesRef: MutableRefObject<null>,
  targetsRef: MutableRefObject<null>,
  inputtingModes: Mode[][],
  selectingCommands: Command[][],
  inputtingCommands: Command[][]
): Command {
  const key = event.key;
  const ix = inputtingModes.findIndex((modes) => {
    return modes.includes(mode);
  });
  if (ix === -1) {
    return Command.Nothing;
  }
  const iy = inputtingModes[ix].indexOf(mode);
  if (key === "Escape") {
    return selectingCommands[ix][iy];
  }
  if (key === "Enter" || key === "Tab") {
    // event.isComposingが使えないことが判明した。変換候補が表示されている状態でデフォルトの選択肢をEnterするとisComposingがfalseのままになっている
    // event.keyCodeが代わりに使えるということで、非推奨だが使う
    if (
      event.keyCode !== 13 || //@ts-ignore
      sourcesRef?.current?.isMenuOpen() || //@ts-ignore
      targetsRef?.current?.isMenuOpen()
    ) {
      return Command.Nothing;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return isFilter(mode) ? Command.Nothing : Command.ConfirmEdit;
    }
    if (event.shiftKey) {
      return getPrevItem(inputtingCommands, ix, iy);
    }
    return getNextItem(inputtingCommands, ix, iy);
  }
  return Command.Nothing;
}

export function keyEventToCommand(
  mode: Mode,
  viewMode: ViewMode,
  event: KeyboardEvent,
  sourcesRef: MutableRefObject<null>,
  targetsRef: MutableRefObject<null>,
  shouldSwap: [boolean, boolean]
): Command {
  const key = event.key;
  // console.log("key", key);
  switch (mode) {
    case Mode.Normal:
      if (key === "Escape" || key === "c" || key === "Backspace") {
        return Command.Cancel;
      }
      if (key === "n") {
        return Command.CreateTaskNode;
      }
      if (key === "w") {
        return Command.SelectAnotherLocation;
      }
      if (key === "f") {
        return Command.SelectFilterTitle;
      }
      if (key === "q") {
        return Command.Rename;
      }
      if (key === "u") {
        return Command.Undo;
      }
      if (key === "r") {
        return Command.Redo;
      }
      if (key === "e") {
        return Command.SelectView;
      }
      if (selectString.includes(key)) {
        return Command.SelectTaskNode;
      }
      if (key === "b") {
        return Command.OpenSideBar;
      }
      if (viewMode === ViewMode.Graph || viewMode === ViewMode.Tile) {
        if (key === "+") {
          return Command.ZoomIn;
        }
        if (key === "-") {
          return Command.ZoomOut;
        }
        const stringsAndCommands: [string[], Command][] = [
          [leftStrings, Command.PanLeft],
          [rightStrings, Command.PanRight],
          [downStrings, Command.PanDown],
          [upStrings, Command.PanUp],
        ];
        const maybeC = stringsAndCommands
          .filter(([strings, _]) => strings.includes(key))
          .map(([_, command]) => command)
          .at(0);
        if (maybeC) {
          return maybeC;
        }
      }
      if (viewMode === ViewMode.Gantt) {
        if (key === "s") {
          return Command.SelectSpan;
        }
      }
      return Command.Nothing;
    case Mode.NodeSelecting:
      if (key === "Escape" || key === "c" || key === "Backspace") {
        return Command.Cancel;
      }
      if (key === "x") {
        return Command.DeleteTaskNode;
      }
      if (key === "e") {
        return Command.SelectTitle;
      }
      if (key === "w") {
        return Command.SetToWorking;
      }
      if (key === "p") {
        return Command.SetToPending;
      }
      if (key === "d") {
        return Command.SetToDone;
      }
      if (key === "f") {
        return Command.ViewMarkdownFile;
      }
      if (key === "b") {
        return Command.OpenSideBar;
      }
      return Command.Nothing;
    case Mode.ViewSelecting:
      if (key === "e") {
        return Command.ToGraph;
      }
      if (key === "t") {
        return Command.ToTile;
      }
      if (key === "g") {
        return Command.ToGantt;
      }
      if (key === "l") {
        return Command.ToTimeLine;
      }
      if (key === "Escape" || key === "Enter") {
        return Command.Cancel;
      }
      return Command.Nothing;

    case Mode.SpanSelecting:
      if (key === "h") {
        return Command.SpanHour;
      }
      if (key === "d") {
        return Command.SpanDay;
      }
      if (key === "w") {
        return Command.SpanWeek;
      }
      if (key === "m") {
        return Command.SpanMonth;
      }
      if (key === "y") {
        return Command.SpanYear;
      }
      return Command.Nothing;

    case Mode.TitleSelecting:
    case Mode.StatusSelecting:
    case Mode.AssigneeSelecting:
    case Mode.SourcesSelecting:
    case Mode.TargetsSelecting:
    case Mode.EstimatedTimeSelecting:
    case Mode.SpentTimeSelecting:
    case Mode.StartDateTimeSelecting:
    case Mode.EndDateTimeSelecting:
    case Mode.MemoSelecting:
      return handleSelectMode(
        mode,
        event,
        selectingModes,
        selectingCommands,
        inputtingCommands
      );
    case Mode.TitleInputting:
    case Mode.StatusInputting:
    case Mode.AssigneeInputting:
    case Mode.SourcesInputting:
    case Mode.TargetsInputting:
    case Mode.EstimatedTimeInputting:
    case Mode.SpentTimeInputting:
    case Mode.StartDateTimeInputting:
    case Mode.EndDateTimeInputting:
    case Mode.MemoInputting:
      return handleInputMode(
        mode,
        event,
        sourcesRef,
        targetsRef,
        inputtingModes,
        selectingCommands,
        inputtingCommands
      );
    case Mode.FilterTitleSelecting:
    case Mode.FilterStatusSelecting:
    case Mode.FilterAssigneeSelecting:
    case Mode.FilterSourcesSelecting:
    case Mode.FilterTargetsSelecting:
    case Mode.FilterMemoSelecting:
      return handleSelectMode(
        mode,
        event,
        selectingFilterModes,
        selectingFilterCommands,
        inputtingFilterCommands
      );
    case Mode.FilterTitleInputting:
    case Mode.FilterStatusInputting:
    case Mode.FilterAssigneeInputting:
    case Mode.FilterSourcesInputting:
    case Mode.FilterTargetsInputting:
    case Mode.FilterMemoInputting:
      return handleInputMode(
        mode,
        event,
        sourcesRef,
        targetsRef,
        inputtingFilterModes,
        selectingFilterCommands,
        inputtingFilterCommands
      );
    case Mode.MarkDownViewing:
      if (key === "i") {
        return Command.InputMarkdownFile;
      }
      if (key === "Escape") {
        return Command.ConfirmEdit;
      }
      if (key === "e") {
        return Command.OpenEditor;
      }
      if (key === "s") {
        return Command.SetEditor;
      }
      return Command.Nothing;
    case Mode.MarkDownInputting:
      if (key === "Escape") {
        return Command.ViewMarkdownFile;
      }
      return Command.Nothing;
    case Mode.EditorSetting:
      if (key === "Escape") {
        return Command.ViewMarkdownFile;
      }
      return Command.Nothing;
    case Mode.SideBarSelecting:
      if (key === "Escape" || key === "Enter") {
        return Command.Cancel;
      }
      if (key === "c") {
        return Command.CloseSideBar;
      }
      if (key === "e") {
        return Command.SelectTitle;
      }
      if (upStrings.includes(key)) {
        return Command.SelectAbove;
      }
      if (downStrings.includes(key)) {
        return Command.SelectBelow;
      }
      if (leftStrings.includes(key) && shouldSwap[0]) {
        return Command.SwapAbove;
      }
      if (rightStrings.includes(key) && shouldSwap[1]) {
        return Command.SwapBelow;
      }
      return Command.Nothing;
  }
}
