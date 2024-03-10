import { GlobalContext } from "@/contexts/globalContext";
import { MainContext } from "@/contexts/mainContext";
import { Task, hasNotDoneChildTask } from "@/models/task";
import { zip } from "@/utils";
import { Mode } from "@/vim/mode";
import { ViewMode } from "@/vim/viewMode";
import { List } from "immutable";
import { useContext } from "react";
import { Key } from "./key";

export function KeyBar() {
  const { tasks, stackedTasks, swappable } = useContext(GlobalContext);
  const { mode, viewMode } = useContext(MainContext);
  return (
    <div className="flex">
      {createElements(mode, viewMode, tasks, stackedTasks, swappable)}
    </div>
  );
}

function createLabelsAndKeys(
  mode: Mode,
  viewMode: ViewMode,
  tasks: List<Task>,
  stackedTasks: List<Task>,
  swappable: [boolean, boolean]
): [string[], string[][]] {
  const ESC = "Escape";
  const Enter = "Enter";
  const ModifierEnter = "(ctrl|cmd|alt)Enter"; // shiftは戻る時に使っている時がある。

  switch (mode) {
    case Mode.Normal:
      const normalLabels = [
        "New node",
        "Select Another File",
        "Filter",
        "Rename User",
        "Change View",
        "Undo",
        "Redo",
        "SideBar",
      ];
      const normalKeys = [
        ["n"],
        ["w"],
        ["f"],
        ["q"],
        ["e"],
        ["u"],
        ["r"],
        ["b"],
      ];
      if (viewMode === ViewMode.Gantt) {
        return [
          [...normalLabels, "Select Span"],
          [...normalKeys, ["s"]],
        ];
      }
      if (viewMode === ViewMode.Graph || viewMode === ViewMode.Tile) {
        return [
          [...normalLabels, "ZoomIn", "ZoomOut"],

          [...normalKeys, ["+"], ["-"]],
        ];
      }
      return [normalLabels, normalKeys];
    case Mode.NodeSelecting:
      const labelsNodeSelecting = [
        "Edit",
        "Delete",
        "Cancel",
        "View Memo",
        "SideBar",
        "Set to Working",
        "Set to Pending",
        "Set to Done",
      ];
      const keyNodeSelecting = [
        ["e"],
        ["x"],
        [ESC],
        ["f"],
        ["b"],
        ["w"],
        ["p"],
        ["d"],
      ];

      // Doneじゃないタスクがある場合、statusは選択できないようにする
      return hasNotDoneChildTask(tasks)
        ? [labelsNodeSelecting.slice(0, 5), keyNodeSelecting.slice(0, 5)]
        : [labelsNodeSelecting, keyNodeSelecting];
    case Mode.ViewSelecting:
      return [
        ["Graph", "Tile", "Gantt", "TimeLine"],
        [["e"], ["t"], ["g"], ["l"]],
      ];
    case Mode.SpanSelecting:
      return [
        ["Hour", "Day", "Week", "Month", "Year"],
        [["h"], ["d"], ["w"], ["m"], ["y"]],
      ];
    case Mode.TitleSelecting:
    case Mode.TitleInputting:
    case Mode.StatusSelecting:
    case Mode.StatusInputting:
    case Mode.AssigneeSelecting:
    case Mode.AssigneeInputting:
    case Mode.SourcesSelecting:
    case Mode.SourcesInputting:
    case Mode.TargetsSelecting:
    case Mode.TargetsInputting:
    case Mode.EstimatedTimeSelecting:
    case Mode.EstimatedTimeInputting:
    case Mode.SpentTimeSelecting:
    case Mode.SpentTimeInputting:
    case Mode.StartDateTimeSelecting:
    case Mode.StartDateTimeInputting:
    case Mode.EndDateTimeSelecting:
    case Mode.EndDateTimeInputting:
    case Mode.MemoSelecting:
    case Mode.MemoInputting:
      return [
        ["Confirm", "Cancel"],
        [[ModifierEnter], [ESC]],
      ];
    case Mode.FilterTitleSelecting:
    case Mode.FilterTitleInputting:
    case Mode.FilterStatusSelecting:
    case Mode.FilterStatusInputting:
    case Mode.FilterAssigneeSelecting:
    case Mode.FilterAssigneeInputting:
    case Mode.FilterSourcesSelecting:
    case Mode.FilterSourcesInputting:
    case Mode.FilterTargetsSelecting:
    case Mode.FilterTargetsInputting:
    case Mode.FilterMemoSelecting:
    case Mode.FilterMemoInputting:
      return [["Done"], [[`${ESC}|${ModifierEnter}`]]];
    case Mode.MarkDownViewing:
      return [
        ["Input", "Back", "Editor", "Set Editor"],
        [["i"], [ESC], ["e"], ["s"]],
      ];
    case Mode.MarkDownInputting:
      return [["Done"], [[ESC]]];
    case Mode.EditorSetting:
      return [["Done"], [[`${ESC}|${Enter}`]]];
    case Mode.SideBarSelecting:
      const selectedIndex = stackedTasks.findIndex(
        ({ isSelected }) => isSelected
      );
      const sideBarBaseLabels = [
        "Done",
        "Close",
        "Edit",
        "Set to Working",
        "Set to Pending",
        "Set to Done",
        "Up",
        "Down",
      ];
      const sideBarBaseKeys = [
        [`${ESC}|${Enter}`],
        ["c"],
        ["e"],
        ["w"],
        ["p"],
        ["d"],
        ["↑|k"],
        ["↓|j"],
      ];
      if (selectedIndex === -1) {
        return [sideBarBaseLabels, sideBarBaseKeys];
      }
      const [swappableAbove, swappableBelow] = swappable;

      return [
        sideBarBaseLabels.concat(
          swappableAbove ? ["Swap Above"] : [],
          swappableBelow ? ["Swap Below"] : []
        ),
        sideBarBaseKeys.concat(
          swappableAbove ? [["←|h"]] : [],
          swappableBelow ? [["→|l"]] : []
        ),
      ];
  }
}

function createElements(
  mode: Mode,
  viewMode: ViewMode,
  tasks: List<Task>,
  stackedTasks: List<Task>,
  swappable: [boolean, boolean]
): React.JSX.Element[] {
  const [labels, keys] = createLabelsAndKeys(
    mode,
    viewMode,
    tasks,
    stackedTasks,
    swappable
  );
  return zip(labels, keys).map(([label, key]) => {
    return Key({
      label: label,
      keys: [...key],
      isSelectedArray: Array.from({ length: key.length }, () => false),
    });
  });
}
