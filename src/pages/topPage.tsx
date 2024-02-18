"use client";
import { GlobalContext } from "@/app/page";
import { InputUserName } from "@/components/inputUserName";
import { SelectSaveLocation } from "@/components/selectSaveLocation";
import { Assignee } from "@/models/assignee";
import { loadData, loadInitialFilePath } from "@/models/file";
import { MainPage } from "@/pages/mainPage";
import { useContext, useEffect, useState } from "react";

export function TopPage() {
  const { filePath, setFilePath, userName, setUserName, setTasks } =
    useContext(GlobalContext);
  const [assignees, setAssignees] = useState<Set<Assignee>>(new Set());

  useEffect(() => {
    loadInitialFilePath().then((newFilePath) => {
      loadData(newFilePath, setFilePath, setTasks, setAssignees, setUserName);
    });
  }, [setFilePath, setUserName, setTasks]);

  return (
    <div className={"homepage"}>
      {filePath === "" ? (
        <SelectSaveLocation setAssignees={setAssignees} />
      ) : userName === "" ? (
        <InputUserName assignees={assignees} setAssignees={setAssignees} />
      ) : (
        <MainPage assignees={assignees} setAssignees={setAssignees} />
      )}
    </div>
  );
}
