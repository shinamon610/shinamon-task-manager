import { GlobalContext } from "@/contexts/globalContext";
import { MainContext } from "@/contexts/mainContext";
import { Task, hasNotDoneChildTask } from "@/models/task";
import { zip } from "@/utils";
import { Mode } from "@/vim/mode";
import { List } from "immutable";
import { useContext } from "react";
import { Key } from "./key";

export function KeyBar() {
  const { tasks } = useContext(GlobalContext);
  const { mode } = useContext(MainContext);
  return <div className="top-bar">{createElements(mode, tasks)}</div>;
}

function createLabelsAndKeys(
  mode: Mode,
  tasks: List<Task>
): [string[], string[][]] {
  switch (mode) {
    case Mode.Normal:
      return [
        [
          "New node",
          "Select Another File",
          "Filter",
          "Rename User",
          "View",
          "Undo",
          "Redo",
        ],
        [["n"], ["w"], ["f"], ["q"], ["v"], ["u"], ["r"]],
      ];
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
        ["esc"],
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
        ["Graph", "Tile", "Gantt", "Confirm"],
        [["e"], ["t"], ["g"], ["esc", "Enter"]],
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
        [["ctrl|cmd|alt", "Enter"], ["esc"]],
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
      return [["Done"], [["esc"]]];
    case Mode.MarkDownViewing:
      return [
        ["Input", "Back", "Editor", "Set Editor"],
        [["i"], ["Escape"], ["e"], ["s"]],
      ];
    case Mode.MarkDownInputting:
      return [["Done"], [["Escape"]]];
    case Mode.EditorSetting:
      return [["Done"], [["Escape|Enter"]]];
  }
}

function createElements(mode: Mode, tasks: List<Task>): React.JSX.Element[] {
  const [labels, keys] = createLabelsAndKeys(mode, tasks);
  return zip(labels, keys).map(([label, key]) => {
    return Key({
      label: label,
      keys: [...key],
      isSelectedArray: Array.from({ length: key.length }, () => false),
      isDeadArray: Array.from({ length: key.length }, () => false),
    });
  });
}
