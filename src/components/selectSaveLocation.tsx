import { createThenSaveFilePath, openThenSaveFilePath } from "@/models/file";
import React from "react";

type SelectSaveLocationProps = {
  setFilePath: React.Dispatch<React.SetStateAction<string>>;
};
export function SelectSaveLocation({ setFilePath }: SelectSaveLocationProps) {
  const style = {
    backgroundColor: "var(--active)",
    fontSize: "10vh",
    boxShadow: "5px 5px 10px rgba(255, 255, 255, 0.5)",
    borderRadius: "10px",
    margin: "10px",
  };
  function onClick(getFilePath: () => Promise<string | null>) {
    getFilePath().then((newFilePath) => {
      if (newFilePath === null) {
        return;
      }
      setFilePath(newFilePath);
    });
  }
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <button style={style} onClick={() => onClick(createThenSaveFilePath)}>
        Select Save Location
      </button>
      <button style={style} onClick={() => onClick(openThenSaveFilePath)}>
        Load Tasks
      </button>
    </div>
  );
}
