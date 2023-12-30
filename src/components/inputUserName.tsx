import React from "react";
import { FlexContainer } from "./flexContainer";

type InputUserNameProps = {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  setConfirmedUserName: React.Dispatch<React.SetStateAction<boolean>>;
};

export function InputUserName({
  userName,
  setUserName,
  setConfirmedUserName,
}: InputUserNameProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <FlexContainer
        components={[
          <label key={"u"} style={{ backgroundColor: "white" }}>
            UserName:
          </label>,
          <input
            key={"in"}
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                setConfirmedUserName(true);
              }
            }}
            autoFocus
          ></input>,
        ]}
        isSelected={true}
        ratios={[0, 1]}
      />
    </div>
  );
}
