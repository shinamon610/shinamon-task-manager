import { Mode } from "@/vim/mode";
import { Editable, useEditor } from "@wysimark/react";
import { useState } from "react";

type Props = {
  memo: string;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
  mode: Mode;
};
export default function MarkdownViewer({ memo, setMemo, mode }: Props) {
  const [markdown, setMarkdown] = useState(memo);
  const editor = useEditor({});
  return (
    <Editable
      editor={editor}
      value={markdown}
      onChange={(e) => {
        if (mode !== Mode.MarkDownInputting) {
          return;
        }
        setMarkdown(e);
        setMemo(e);
      }}
      className="bg-transparent text-white"
    />
  );
}
