import { Editable, useEditor } from "@wysimark/react";
import { useState } from "react";

export default function MarkdownViewer() {
  const [markdown, setMarkdown] = useState("# Hello World");
  const editor = useEditor({});
  return <Editable editor={editor} value={markdown} onChange={setMarkdown} />;
}
