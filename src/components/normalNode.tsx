import { createLabelSelectArray } from "@/models/labels";
import { Mode } from "@/vim/mode";
import React, { memo } from "react";
import { Handle, NodeProps, NodeToolbar, Position } from "reactflow";
import { Key } from "./key";

function createLabels(
  serialInput: string | null,
  mode: Mode,
  label: string | null
): React.JSX.Element[] {
  if (mode === Mode.Normal) {
    const l = label === null ? "" : label;
    const si = serialInput === null ? "" : serialInput;
    const isSelectedArray = createLabelSelectArray(l, si);

    return [
      Key({
        label: "",
        keys: l.split(""),
        isSelectedArray,
      }),
    ];
  }
  return [];
}

const NormalNode = memo(({ data }: NodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <NodeToolbar isVisible={true} position={Position.Top} offset={0}>
        {createLabels(data.serialInput, data.mode, data.label)}
      </NodeToolbar>
      <div className="node-content">{data.title}</div>
      <div className="node-content" style={{ color: data.color }}>
        {data.assignee}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        isConnectable={false}
      />
    </>
  );
});

NormalNode.displayName = "NormalNode";

export default NormalNode;
