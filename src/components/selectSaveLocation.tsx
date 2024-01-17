import { selectThenSaveFilePath } from "@/models/file";
import React from "react";

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
        style={{
          backgroundColor: "var(--active)",
          fontSize: "10vh",
          boxShadow: "5px 5px 10px rgba(255, 255, 255, 0.5)",
          borderRadius: "10px",
        }}
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
