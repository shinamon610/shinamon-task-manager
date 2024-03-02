import { zip } from "@/utils";
import { v4 } from "uuid";

type KeyProps = {
  label: string;
  keys: string[];
  isSelectedArray: boolean[];
};

export function Key({ label, keys, isSelectedArray }: KeyProps) {
  const results = label === "" ? [] : [<samp key={label}>{label}</samp>];

  zip(keys, isSelectedArray).forEach(([keyLabel, isSelected], i) => {
    if (isSelected) {
      results.push(
        <kbd key={i} className="key-pushed">
          {keyLabel}
        </kbd>
      );
    } else {
      results.push(<kbd key={i}>{keyLabel}</kbd>);
    }
  });

  return (
    <div className="node-label" key={v4()}>
      {results}
    </div>
  );
}
