import { Mode } from "@/vim/mode";
import React, { memo } from "react";
import { Handle, Position, NodeToolbar, NodeProps } from "reactflow";
import { zip } from "@/utils";
import { Key } from "./key";
import { createLabelSelectArray } from "@/models/labels";

function createLabels(
  serialInput: string | null,
  mode: Mode,
  label: string | null,
  selected: boolean
): React.JSX.Element[] {
  switch (mode) {
    case Mode.Normal:
      const l = label === null ? "" : label;
      const si = serialInput === null ? "" : serialInput;
      let isSelectedArray = createLabelSelectArray(l, si);

      return [
        Key({
          label: "select",
          keys: l.split(""),
          isSelectedArray,
          isDeadArray: [false],
        }),
      ];
    case Mode.NodeSelecting:
      if (!selected) {
        return [];
      }
      const opeLabels = ["Edit", "Delete"];
      const opeKeys = ["e", "d"];
      return zip(opeLabels, opeKeys).map(([label, key]) => {
        return Key({
          label,
          keys: [key],
          isSelectedArray: [false],
          isDeadArray: [false],
        });
      });
    case Mode.TitleSelecting:
    case Mode.TitleInputting:
    case Mode.StatusSelecting:
    case Mode.StatusInputting:
    case Mode.AssigneeSelecting:
    case Mode.AssigneeInputting:
    case Mode.SourcesSelecting:
    case Mode.SourcesInputting:
    case Mode.TargetsSelecting:
    case Mode.TargetsInputting:
    case Mode.EstimatedTimeSelecting:
    case Mode.EstimatedTimeInputting:
    case Mode.SpentTimeSelecting:
    case Mode.SpentTimeInputting:
    case Mode.StartDateTimeSelecting:
    case Mode.StartDateTimeInputting:
    case Mode.EndDateTimeSelecting:
    case Mode.EndDateTimeInputting:
    case Mode.MemoSelecting:
    case Mode.MemoInputting:
    case Mode.PurifyInputting:
      return [];
  }
}

const NormalNode = memo(({ data, selected }: NodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <NodeToolbar isVisible={true} position={Position.Top} offset={0}>
        {createLabels(data.serialInput, data.mode, data.label, selected)}
      </NodeToolbar>
      <div className="node-content">{data.title}</div>
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
