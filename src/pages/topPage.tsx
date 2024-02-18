"use client";
import { GlobalContext } from "@/app/page";
import { InputUserName } from "@/components/inputUserName";
import { SelectSaveLocation } from "@/components/selectSaveLocation";
import { loadData, loadInitialFilePath } from "@/models/file";
import { MainPage } from "@/pages/mainPage";
import { useContext, useEffect } from "react";

export function TopPage() {
  const {
    filePath,
    setFilePath,
    userName,
    setUserName,
    setTasks,
    setAssignees,
  } = useContext(GlobalContext);

  useEffect(() => {
    loadInitialFilePath().then((newFilePath) => {
      loadData(newFilePath, setFilePath, setTasks, setAssignees, setUserName);
    });
  }, [setFilePath, setUserName, setTasks, setAssignees]);

  return (
    <div className={"homepage"}>
      {filePath === "" ? (
        <SelectSaveLocation />
      ) : userName === "" ? (
        <InputUserName />
      ) : (
        <MainPage />
      )}
    </div>
  );
}
