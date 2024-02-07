import { Mode } from "@/vim/mode";
import { Editable, useEditor } from "@wysimark/react";
import { useEffect, useState } from "react";

type Props = {
  memo: string;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
  mode: Mode;
};
export default function MarkdownViewer({ memo, setMemo, mode }: Props) {
  const [markdown, setMarkdown] = useState(memo);
  const editor = useEditor({});

  useEffect(() => {
    const editableElement = document.querySelector(".editable-content");
    if (!editableElement) return;
    if (mode === Mode.MarkDownInputting) {
      // @ts-ignore
      editableElement.focus();
    } else {
      // @ts-ignore
      editableElement.blur();
    }

    const handleEvent = () => {
      // @ts-ignore
      editableElement.blur();
    };

    editableElement.addEventListener("focus", handleEvent, true);

    return () => {
      editableElement.removeEventListener("focus", handleEvent, true);
    };
  }, [mode]);

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
      className="editable-content bg-transparent text-white"
    />
  );
}
