import { MainContext } from "@/contexts/mainContext";
import { Mode } from "@/vim/mode";
import { TextareaAutosize } from "@mui/material";
import { useContext, useEffect, useRef } from "react";

type Props = {
  memo: string;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
};
export default function MarkdownViewer({ memo, setMemo }: Props) {
  const { mode } = useContext(MainContext);
  const ref = useRef(null);
  useEffect(() => {
    if (mode === Mode.MarkDownInputting) {
      // @ts-ignore
      ref.current.focus();
    } else {
      // @ts-ignore
      ref.current.blur();
    }
  }, [mode]);

  return (
    <TextareaAutosize
      disabled={mode !== Mode.MarkDownInputting}
      ref={ref}
      value={memo}
      onChange={(e) => {
        setMemo(e.target.value);
      }}
      style={{ backgroundColor: "var(--active)" }}
    />
  );
}
