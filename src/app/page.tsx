"use client";
import { InputUserName } from "@/components/inputUserName";
import { MainPage } from "@/components/mainPage";
import { SelectSaveLocation } from "@/components/selectSaveLocation";
import { Assignee, extractAssignees } from "@/models/assignee";
import { loadData, loadInitialFilePath } from "@/models/file";
import { Task } from "@/models/task";
import { useEffect, useState } from "react";

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
      loadData(newFilePath).then((data) => {
        setTasks(data.tasks);
        setAssignees(extractAssignees(data.tasks).add(data.userName));
        setUserName(data.userName);
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
