"use client";
import { InputUserName } from "@/components/inputUserName";
import { SelectSaveLocation } from "@/components/selectSaveLocation";
import { GlobalContext } from "@/contexts/globalContext";
import { MainProvider } from "@/contexts/mainContext";
import { MainPage } from "@/templates/mainPage";
import { useContext, useEffect } from "react";

export function TopPage() {
  const { dirPath, userName, initializeData } = useContext(GlobalContext);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <div>
      {dirPath === "" ? (
        <SelectSaveLocation />
      ) : userName === "" ? (
        <InputUserName />
      ) : (
        <MainProvider>
          <MainPage />
        </MainProvider>
      )}
    </div>
  );
}
