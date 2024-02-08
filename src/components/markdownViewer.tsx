import { Mode } from "@/vim/mode";
import { TextareaAutosize } from "@mui/material";

type Props = {
  memo: string;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
  mode: Mode;
};
export default function MarkdownViewer({ memo, setMemo, mode }: Props) {
  return (
    <TextareaAutosize
      value={memo}
      onChange={(e) => {
        console.log(e.target.value);
        setMemo(e.target.value);
      }}
      style={{ backgroundColor: "var(--active)" }}
    />
  );
}
