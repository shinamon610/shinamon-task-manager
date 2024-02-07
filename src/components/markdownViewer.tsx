import { Editable, useEditor } from "@wysimark/react";
import { useState } from "react";

type Props = {
  memo: string;
};
export default function MarkdownViewer({ memo }: Props) {
  const [markdown, setMarkdown] = useState(memo);
  const editor = useEditor({});
  return (
    <Editable
      editor={editor}
      value={markdown}
      onChange={(e) => {
        setMarkdown(e);
      }}
      className="bg-transparent text-white"
    />
  );
}
