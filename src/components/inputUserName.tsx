import { CreatableBox } from "./creatableBox";
import React from "react";
import { FlexContainer } from "./flexContainer";
import { idf } from "@/utils";

type InputUserNameProps = {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  assignees: Set<string>;
  setAssignees: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export function InputUserName({
  userName,
  setUserName,
  assignees,
  setAssignees,
}: InputUserNameProps) {
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
