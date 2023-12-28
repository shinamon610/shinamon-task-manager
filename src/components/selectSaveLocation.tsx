import React from "react";
import { selectThenSaveFilePath } from "@/models/file";

type SavaFileButtonProps = {
  filePath: string;
  setFilePath: React.Dispatch<React.SetStateAction<string>>;
};
export function SaveFileButton({ filePath, setFilePath }: SavaFileButtonProps) {
  return (
    <button
      onClick={() =>
        selectThenSaveFilePath().then((newFilePath) => {
          if (newFilePath === null) {
            return;
          }
          setFilePath(newFilePath);
        })
      }
    >
      Select Sava Location
    </button>
  );
}
