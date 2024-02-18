import { EditorSettingTextBox } from "@/components/editorSettingTextBox";
import { FlexContainer } from "@/components/flexContainer";
import { KeyBar } from "@/components/keyBar";
import MarkdownViewer from "@/components/markdownViewer";
import { MainContext } from "@/contexts/mainContext";
import { useContext } from "react";

type Props = {
  editor: string;
  setEditor: React.Dispatch<React.SetStateAction<string>>;
};

export function MarkdownPage({ editor, setEditor }: Props) {
  const { memo, setMemo } = useContext(MainContext);
  return (
    <>
      <MarkdownViewer memo={memo} setMemo={setMemo} />
      <FlexContainer
        components={[
          <KeyBar key={"m0"} />,
          <label key={"m1"} style={{ backgroundColor: "var(--active)" }}>
            Editor:
          </label>,
          <EditorSettingTextBox
            key={"m2"}
            editor={editor}
            setEditor={setEditor}
          />,
        ]}
        isSelected={false}
        ratios={[1, 0, 1]}
      />
    </>
  );
}
