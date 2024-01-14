import { zip } from "@/utils";
import { v4 } from "uuid";

type KeyProps = {
  label: string;
  keys: string[];
  isSelectedArray: boolean[];
  isDeadArray: boolean[];
};

export function Key({ label, keys, isSelectedArray, isDeadArray }: KeyProps) {
  const results = label === "" ? [] : [<samp key={label}>{label}</samp>];

  zip(zip(keys, isSelectedArray), isDeadArray).forEach(
    ([[keyLabel, isSelected], isDead], i) => {
      if (isDead) {
        results.push(
          <kbd key={keyLabel} className="dead">
            {keyLabel}
          </kbd>
        );
      } else if (isSelected) {
        results.push(
          <kbd key={i} className="key-pushed">
            {keyLabel}
          </kbd>
        );
      } else {
        results.push(<kbd key={i}>{keyLabel}</kbd>);
      }
    }
  );

  return (
    <div className="node-label" key={v4()}>
      {results}
    </div>
  );
}
