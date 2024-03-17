"use client";
import { InputUserName } from "@/components/inputUserName";
import { SelectSaveLocation } from "@/components/selectSaveLocation";
import { GlobalContext } from "@/contexts/globalContext";
import { MainProvider } from "@/contexts/mainContext";
import { MainPage } from "@/templates/mainPage";
import { useContext, useEffect } from "react";

export function TopPage() {
  const { filePath, userName, initializeData } = useContext(GlobalContext);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <div>
      {filePath === "" ? (
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
