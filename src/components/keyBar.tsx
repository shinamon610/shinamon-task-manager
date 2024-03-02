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
  const { tasks } = useContext(GlobalContext);
  const { mode, viewMode } = useContext(MainContext);
  return <div className="flex">{createElements(mode, viewMode, tasks)}</div>;
}

function createLabelsAndKeys(
  mode: Mode,
  viewMode: ViewMode,
  tasks: List<Task>
): [string[], string[][]] {
  const ESC = "Escape";
  const Enter = "Enter";
  const ModifierEnter = "(shift|ctrl|cmd|alt)Enter";

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
      ];
      const normalKeys = [["n"], ["w"], ["f"], ["q"], ["e"], ["u"], ["r"]];
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
        "Set to Working",
        "Set to Pending",
        "Set to Done",
        "View Memo",
      ];
      const keyNodeSelecting = [
        ["e"],
        ["x"],
        [ESC],
        ["w"],
        ["p"],
        ["d"],
        ["f"],
      ];

      // Doneじゃないタスクがある場合、statusは選択できないようにする
      return hasNotDoneChildTask(tasks)
        ? [labelsNodeSelecting.slice(0, 3), keyNodeSelecting.slice(0, 3)]
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
  }
}

function createElements(
  mode: Mode,
  viewMode: ViewMode,
  tasks: List<Task>
): React.JSX.Element[] {
  const [labels, keys] = createLabelsAndKeys(mode, viewMode, tasks);
  return zip(labels, keys).map(([label, key]) => {
    return Key({
      label: label,
      keys: [...key],
      isSelectedArray: Array.from({ length: key.length }, () => false),
    });
  });
}
