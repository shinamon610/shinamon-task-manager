import { Mode } from "@/vim/mode";
import { useEffect, useRef } from "react";

type Props = {
  editor: string;
  setEditor: React.Dispatch<React.SetStateAction<string>>;
  mode: Mode;
};

export function EditorSettingTextBox({ editor, setEditor, mode }: Props) {
  const ref = useRef(null);
  useEffect(() => {
    if (mode === Mode.EditorSetting) {
      // @ts-ignore
      ref.current.focus();
    } else {
      // @ts-ignore
      ref.current.blur();
    }
  }, [mode]);

  return (
    <input
      key={"editor-input"}
      style={{ backgroundColor: "var(--active)" }}
      value={editor}
      disabled={mode !== Mode.EditorSetting}
      ref={ref}
      onChange={(e) => {
        setEditor(e.target.value);
      }}
    />
  );
}
