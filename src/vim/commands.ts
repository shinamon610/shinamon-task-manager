import { MutableRefObject } from "react";
import { Mode, selectingModes, inputtingModes } from "./mode";
import { getNextItem, getPrevItem } from "@/utils";

export enum Command {
  CreateTaskNode,
  DeleteTaskNode,
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
  Purify,
  Fit,
  ZoomIn,
  ZoomOut,
  PanLeft,
  PanDown,
  PanUp,
  PanRight,
  SelectTaskNode,
  Nothing,
  Cancel,
  ConfirmEdit,
  SelectAnotherLocation,
  Rename,
}

export const selectString = "agi";
const leftStrings = ["ArrowLeft", "h"];
const downStrings = ["ArrowDown", "j"];
const upStrings = ["ArrowUp", "k"];
const rightStrings = ["ArrowRight", "l"];

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

function handleSelectMode(mode: Mode, event: KeyboardEvent): Command {
  const key = event.key;
  const ix = selectingModes.findIndex((modes) => {
    return modes.includes(mode);
  });
  if (ix === -1) {
    return Command.Nothing;
  }
  if (key === "Escape" || key == "c" || key == "Backspace") {
    return Command.Cancel;
  }
  const iy = selectingModes[ix].indexOf(mode);
  if (key === "Enter") {
    if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
      return Command.ConfirmEdit;
    }
    return inputtingCommands[ix][iy];
  }
  if (downStrings.includes(key)) {
    const nextIx = (ix + 1) % selectingCommands.length;
    return selectingCommands[nextIx][iy % selectingCommands[nextIx].length];
  }
  if (upStrings.includes(key)) {
    const nextIx =
      (ix + selectingCommands.length - 1) % selectingCommands.length;
    return selectingCommands[
      (selectingCommands.length + ix - 1) % selectingCommands.length
    ][iy % selectingCommands[nextIx].length];
  }
  if (rightStrings.includes(key)) {
    return selectingCommands[ix][(iy + 1) % selectingCommands[ix].length];
  }
  if (leftStrings.includes(key)) {
    return selectingCommands[ix][
      (selectingCommands[ix].length + iy - 1) % selectingCommands[ix].length
    ];
  }
  return Command.Nothing;
}

function handleInputMode(
  mode: Mode,
  event: KeyboardEvent,
  sourcesRef: MutableRefObject<null>,
  targetsRef: MutableRefObject<null>
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
      return Command.ConfirmEdit;
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
  event: KeyboardEvent,
  sourcesRef: MutableRefObject<null>,
  targetsRef: MutableRefObject<null>
): Command {
  const key = event.key;
  console.log(key);
  switch (mode) {
    case Mode.Normal:
      if (key === "Escape" || key === "c" || key === "Backspace") {
        return Command.Cancel;
      }
      if (key === "n") {
        return Command.CreateTaskNode;
      }
      if (key === "f") {
        return Command.Fit;
      }
      if (key === "w") {
        return Command.SelectAnotherLocation;
      }
      if (key === "p") {
        return Command.Purify;
      }
      if (key === "+") {
        return Command.ZoomIn;
      }
      if (key === "-") {
        return Command.ZoomOut;
      }
      if (key === "r") {
        return Command.Rename;
      }
      if (leftStrings.includes(key)) {
        return Command.PanLeft;
      }
      if (downStrings.includes(key)) {
        return Command.PanDown;
      }
      if (upStrings.includes(key)) {
        return Command.PanUp;
      }
      if (rightStrings.includes(key)) {
        return Command.PanRight;
      }
      if (selectString.includes(key)) {
        return Command.SelectTaskNode;
      }
      return Command.Nothing;
    case Mode.NodeSelecting:
      if (key === "Escape" || key === "c" || key === "Backspace") {
        return Command.Cancel;
      }
      if (key === "d") {
        return Command.DeleteTaskNode;
      }
      if (key === "e") {
        return Command.SelectTitle;
      }
      return Command.Nothing;
    case Mode.PurifyInputting:
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
      return handleSelectMode(mode, event);
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
      return handleInputMode(mode, event, sourcesRef, targetsRef);
  }
}
