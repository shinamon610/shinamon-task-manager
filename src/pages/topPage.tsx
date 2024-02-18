"use client";
import { GlobalContext } from "@/app/page";
import { InputUserName } from "@/components/inputUserName";
import { SelectSaveLocation } from "@/components/selectSaveLocation";
import { MainPage } from "@/pages/mainPage";
import { useContext, useEffect } from "react";

export function TopPage() {
  const { filePath, userName, initializeData } = useContext(GlobalContext);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

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
