"use client";
import { GlobalContext } from "@/app/page";
import { InputUserName } from "@/components/inputUserName";
import { SelectSaveLocation } from "@/components/selectSaveLocation";
import { Assignee } from "@/models/assignee";
import { loadData, loadInitialFilePath } from "@/models/file";
import { Task } from "@/models/task";
import { MainPage } from "@/pages/mainPage";
import { useContext, useEffect, useState } from "react";

export function TopPage() {
  const { filePath, setFilePath } = useContext(GlobalContext);
  const [userName, setUserName] = useState<Assignee>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignees, setAssignees] = useState<Set<Assignee>>(new Set());

  useEffect(() => {
    loadInitialFilePath().then((newFilePath) => {
      loadData(newFilePath, setFilePath, setTasks, setAssignees, setUserName);
    });
  }, [setFilePath]);

  return (
    <div className={"homepage"}>
      {filePath === "" ? (
        <SelectSaveLocation
          userName={userName}
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
