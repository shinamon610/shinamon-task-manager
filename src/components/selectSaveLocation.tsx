import React from "react";
import { selectThenSaveFilePath } from "@/models/file";

type SelectSaveLocationProps = {
  setFilePath: React.Dispatch<React.SetStateAction<string>>;
};
export function SelectSaveLocation({ setFilePath }: SelectSaveLocationProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <button
        style={{ backgroundColor: "var(--active)", fontSize: "10vh" }}
        onClick={() =>
          selectThenSaveFilePath().then((newFilePath) => {
            if (newFilePath === null) {
              return;
            }
            setFilePath(newFilePath);
          })
        }
      >
        Select Save Location
      </button>
    </div>
  );
}
