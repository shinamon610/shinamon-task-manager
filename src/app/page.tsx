"use client";
import { GlobalProvider } from "@/contexts/globalContext";
import { TopPage } from "@/templates/topPage";

const HomePage = () => {
  return (
    <GlobalProvider>
      <TopPage />
    </GlobalProvider>
  );
};

export default HomePage;
