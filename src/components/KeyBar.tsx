import { zip } from "@/utils";
import { Mode } from "@/vim/mode";
import { Key } from "./key";

export function KeyBar({ mode }: { mode: Mode }) {
  return <div className="top-bar">{createElements(mode)}</div>;
}

function createElements(mode: Mode): React.JSX.Element[] {
  const isActive = mode == Mode.Normal;
  if (!isActive) {
    return [];
  }
  const labels = ["New node", "Fit", "Select Another Location"];
  const keys = ["n", "f", "w"];
  return zip(labels, keys).map(([label, key]) => {
    return Key({
      label: label,
      keys: [key],
      isSelectedArray: [false],
      isDeadArray: [!isActive],
    });
  });
}
