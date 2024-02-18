import { MainContext } from "@/contexts/mainContext";
import { Mode } from "@/vim/mode";
import { useContext, useEffect, useRef } from "react";

type Props = {
  editor: string;
  setEditor: React.Dispatch<React.SetStateAction<string>>;
};

export function EditorSettingTextBox({ editor, setEditor }: Props) {
  const ref = useRef(null);
  const { mode } = useContext(MainContext);

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
