import { GlobalContext } from "@/contexts/globalContext";
import { createDir, getTasksJsonFile, loadData, openDir } from "@/models/file";
import { List } from "immutable";
import { useContext } from "react";

export function SelectSaveLocation() {
  const { setFilePath, userName, setUserName, setHistories, setAssignees } =
    useContext(GlobalContext);
  const style = {
    backgroundColor: "var(--active)",
    fontSize: "10vh",
    boxShadow: "5px 5px 10px rgba(255, 255, 255, 0.5)",
    borderRadius: "10px",
    margin: "10px",
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <button
        style={style}
        onClick={() => {
          createDir().then((newDir) => {
            if (newDir == null) {
              return;
            }
            setFilePath(getTasksJsonFile(newDir));
            setHistories(List(List([])));
            setAssignees(new Set([userName]));
            setUserName(userName);
          });
        }}
      >
        Create Save Location
      </button>
      <button
        style={style}
        onClick={() => {
          openDir().then((dirToLoad) => {
            if (dirToLoad === null) {
              return;
            }
            loadData(
              dirToLoad,
              setFilePath,
              setHistories,
              setAssignees,
              setUserName
            );
          });
        }}
      >
        Load Tasks
      </button>
    </div>
  );
}
