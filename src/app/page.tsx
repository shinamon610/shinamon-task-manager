"use client";
import { MainPage } from "@/components/mainPage";
import { SelectSaveLocation } from "@/components/selectSaveLocation";
import { loadInitialFilePath } from "@/models/file";
import { useState, useEffect } from "react";
import { Assignee } from "@/models/assignee";
import { InputUserName } from "@/components/inputUserName";
import { loadTasks } from "@/models/file";
import { Task } from "@/models/task";
import { extractAssignees } from "@/models/assignee";

const HomePage = () => {
  const [filePath, setFilePath] = useState("");
  const [userName, setUserName] = useState<Assignee>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignees, setAssignees] = useState<Set<Assignee>>(new Set());

  useEffect(() => {
    loadInitialFilePath().then((newFilePath) => {
      if (newFilePath === null) {
        return;
      }
      setFilePath(newFilePath);
      loadTasks(newFilePath).then((tasks) => {
        setTasks(tasks);
        setAssignees(extractAssignees(tasks));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={"homepage"}>
      {filePath === "" ? (
        <SelectSaveLocation setFilePath={setFilePath} />
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
};

export default HomePage;
