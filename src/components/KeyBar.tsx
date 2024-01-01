import { zip } from "@/utils";
import { Mode } from "@/vim/mode";
import { Key } from "./key";
import { selectString } from "@/vim/commands";

export function KeyBar({ mode }: { mode: Mode }) {
  return <div className="top-bar">{createElements(mode)}</div>;
}

function createLabelsAndKeys(mode: Mode): [string[], string[][]] {
  switch (mode) {
    case Mode.Normal:
      return [
        ["New node", "Select Another Location", "Purify", "Select", "Rename"],
        [["n"], ["w"], ["p"], selectString.split(""), ["r"]],
      ];
    case Mode.NodeSelecting:
      return [
        ["Edit", "Delete"],
        [["e"], ["d"]],
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
      return [["Confirm"], [["ctrl|cmd|alt", "Enter"]]];
    case Mode.FilterTitleSelecting:
    case Mode.FilterTitleInputting:
    case Mode.FilterStatusSelecting:
    case Mode.FilterStatusInputting:
      return [[], []];
  }
}
function createElements(mode: Mode): React.JSX.Element[] {
  const [labels, keys] = createLabelsAndKeys(mode);
  return zip(labels, keys).map(([label, key]) => {
    return Key({
      label: label,
      keys: [...key],
      isSelectedArray: [false],
      isDeadArray: [false],
    });
  });
}
