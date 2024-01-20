import { Assignee } from "@/models/assignee";
import {
  createThenSaveFilePath,
  loadData,
  openThenSaveFilePath,
} from "@/models/file";
import { Task } from "@/models/task";
import React, { Dispatch, SetStateAction } from "react";

type SelectSaveLocationProps = {
  userName: Assignee;
  setFilePath: React.Dispatch<React.SetStateAction<string>>;
  setTasks: Dispatch<SetStateAction<Task[]>>;
  setAssignees: Dispatch<SetStateAction<Set<string>>>;
  setUserName: Dispatch<SetStateAction<string>>;
};
export function SelectSaveLocation({
  userName,
  setFilePath,
  setTasks,
  setAssignees,
  setUserName,
}: SelectSaveLocationProps) {
  const style = {
    backgroundColor: "var(--active)",
    fontSize: "10vh",
    boxShadow: "5px 5px 10px rgba(255, 255, 255, 0.5)",
    borderRadius: "10px",
    margin: "10px",
  };
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
      <button
        style={style}
        onClick={() => {
          createThenSaveFilePath().then((newFilePath) => {
            if (newFilePath == null) {
              return;
            }
            setFilePath(newFilePath);
            setTasks([]);
            setAssignees(new Set([userName]));
            setUserName(userName);
          });
        }}
      >
        Select Save Location
      </button>
      <button
        style={style}
        onClick={() => {
          openThenSaveFilePath().then((newFilePath) => {
            loadData(
              newFilePath,
              setFilePath,
              setTasks,
              setAssignees,
              setUserName
            );
          });
        }}
      >
        Load Tasks
      </button>
    </div>
  );
}
