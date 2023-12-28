import { Mode } from "@/vim/mode";
import { Key } from "./key";

export const PurifyBar = ({ mode }: { mode: Mode }) => {
  const isActive = mode == Mode.Normal;
  if (!isActive) {
    return null;
  }
  return (
    <div className="purify-bar" style={{ display: "flex" }}>
      <div style={{ flex: 0 }}>
        {Key({
          label: "Purify",
          keys: ["p"],
          isSelectedArray: [false],
          isDeadArray: [!isActive],
        })}
      </div>
      <input type="text" placeholder="text" style={{ flex: 1 }} />
    </div>
  );
};
