import { Task, hasNotDoneChildTask } from "@/models/task";
import { zip } from "@/utils";
import { selectString } from "@/vim/commands";
import { Mode } from "@/vim/mode";
import { Key } from "./key";

export function KeyBar({ mode, tasks }: { mode: Mode; tasks: Task[] }) {
  return <div className="top-bar">{createElements(mode, tasks)}</div>;
}

function createLabelsAndKeys(
  mode: Mode,
  tasks: Task[]
): [string[], string[][]] {
  switch (mode) {
    case Mode.Normal:
      return [
        [
          "New node",
          "Select Another Location",
          "Filter",
          "Select",
          "Rename User",
        ],
        [["n"], ["w"], ["f"], selectString.split(""), ["r"]],
      ];
    case Mode.NodeSelecting:
      const labelsNodeSelecting = [
        "Edit",
        "Delete",
        "Cancel",
        "Set to Working",
        "Set to Pending",
        "Set to Done",
      ];
      const keyNodeSelecting = [["e"], ["x"], ["esc"], ["w"], ["p"], ["d"]];

      // Doneじゃないタスクがある場合、statusは選択できないようにする
      return hasNotDoneChildTask(tasks)
        ? [labelsNodeSelecting.slice(0, 3), keyNodeSelecting.slice(0, 3)]
        : [labelsNodeSelecting, keyNodeSelecting];
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
  }
}
function createElements(mode: Mode, tasks: Task[]): React.JSX.Element[] {
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
