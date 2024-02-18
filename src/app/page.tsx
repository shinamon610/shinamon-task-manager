"use client";
import { TopPage } from "@/pages/topPage";
import { createContext, useState } from "react";

const GlobalContext = createContext({});

function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [filePath, setFilePath] = useState("");
  return (
    <GlobalContext.Provider value={{ filePath, setFilePath }}>
      {children}
    </GlobalContext.Provider>
  );
}

const HomePage = () => {
  return (
    <GlobalProvider>
      <TopPage />
    </GlobalProvider>
  );
};

export default HomePage;
