import { GlobalContext } from "@/contexts/globalContext";
import { idf } from "@/utils";
import { useContext } from "react";
import { CreatableBox } from "./creatableBox";

export function InputUserName() {
  const { userName, setUserName, assignees, setAssignees } =
    useContext(GlobalContext);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div>
        <label key={"userName"} style={{ backgroundColor: "white" }}>
          UserName:
        </label>
        <CreatableBox
          key={"userNameInput"}
          isDisabled={false}
          defaultOption={userName}
          data={assignees}
          setData={setAssignees}
          setSelectedValue={setUserName}
          ref={null}
          toLabel={idf}
          autoFocus={true}
        />
      </div>
    </div>
  );
}
