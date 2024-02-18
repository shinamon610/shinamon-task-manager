import { GlobalContext } from "@/app/page";
import { idf } from "@/utils";
import React, { useContext } from "react";
import { CreatableBox } from "./creatableBox";

type InputUserNameProps = {
  assignees: Set<string>;
  setAssignees: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export function InputUserName({ assignees, setAssignees }: InputUserNameProps) {
  const { userName, setUserName } = useContext(GlobalContext);
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
