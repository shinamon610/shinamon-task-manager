"use client";
import { MainPage } from "@/components/mainPage";
import { SelectSaveLocation } from "@/components/selectSaveLocation";
import { loadInitialFilePath } from "@/models/file";
import { useState, useEffect } from "react";

const HomePage = () => {
  const [filePath, setFilePath] = useState("");
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
      ) : (
        <MainPage filePath={filePath} setFilePath={setFilePath} />
      )}
    </div>
  );
};

export default HomePage;
