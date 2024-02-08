import { Mode } from "@/vim/mode";
import { TextareaAutosize } from "@mui/material";
import { useEffect, useRef } from "react";

type Props = {
  memo: string;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
  mode: Mode;
};
export default function MarkdownViewer({ memo, setMemo, mode }: Props) {
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
