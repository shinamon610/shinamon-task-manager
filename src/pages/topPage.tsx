"use client";
import { InputUserName } from "@/components/inputUserName";
import { SelectSaveLocation } from "@/components/selectSaveLocation";
import { Assignee } from "@/models/assignee";
import { loadData, loadInitialFilePath } from "@/models/file";
import { Task } from "@/models/task";
import { MainPage } from "@/pages/mainPage";
import { useEffect, useState } from "react";

export function TopPage() {
  const [filePath, setFilePath] = useState("");
  const [userName, setUserName] = useState<Assignee>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignees, setAssignees] = useState<Set<Assignee>>(new Set());

  useEffect(() => {
    loadInitialFilePath().then((newFilePath) => {
      loadData(newFilePath, setFilePath, setTasks, setAssignees, setUserName);
    });
  }, []);

  return (
    <div className={"homepage"}>
      {filePath === "" ? (
        <SelectSaveLocation
          userName={userName}
          setFilePath={setFilePath}
          setTasks={setTasks}
          setAssignees={setAssignees}
          setUserName={setUserName}
        />
      ) : userName === "" ? (
        <InputUserName
          userName={userName}
          setUserName={setUserName}
          assignees={assignees}
          setAssignees={setAssignees}
        />
      ) : (
        <MainPage
          filePath={filePath}
          setFilePath={setFilePath}
          userName={userName}
          setUserName={setUserName}
          tasks={tasks}
          setTasks={setTasks}
          assignees={assignees}
          setAssignees={setAssignees}
        />
      )}
    </div>
  );
}
