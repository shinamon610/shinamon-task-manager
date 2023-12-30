"use client";
import { MainPage } from "@/components/mainPage";
import { SelectSaveLocation } from "@/components/selectSaveLocation";
import { loadInitialFilePath } from "@/models/file";
import { useState, useEffect } from "react";
import { Assignee } from "@/models/assignee";
import { InputUserName } from "@/components/inputUserName";

const HomePage = () => {
  const [filePath, setFilePath] = useState("");
  const [userName, setUserName] = useState<Assignee>("");
  const [confirmedUserName, setConfirmedUserName] = useState(false);

  useEffect(() => {
    loadInitialFilePath().then((newFilePath) => {
      if (newFilePath === null) {
        return;
      }
      setFilePath(newFilePath);
    });
  }, []);

  return (
    <div className={"homepage"}>
      {filePath === "" ? (
        <SelectSaveLocation setFilePath={setFilePath} />
      ) : confirmedUserName ? (
        <MainPage filePath={filePath} setFilePath={setFilePath} />
      ) : (
        <InputUserName
          userName={userName}
          setUserName={setUserName}
          setConfirmedUserName={setConfirmedUserName}
        />
      )}
    </div>
  );
};

export default HomePage;
