import { Key } from "./key";

export const PurifyBar = () => {
  return (
    <div className="purify-bar" style={{ display: "flex" }}>
      <div style={{ flex: 0 }}>
        {Key({
          label: "Purify",
          keys: ["p"],
          isSelectedArray: [false],
          isDeadArray: [!false],
        })}
      </div>
      <input type="text" placeholder="text" style={{ flex: 1 }} />
    </div>
  );
};
