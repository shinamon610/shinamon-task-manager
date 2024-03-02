import { GlobalContext } from "@/contexts/globalContext";
import { MainContext } from "@/contexts/mainContext";
import { createLayoutedNodeAndEdges } from "@/lib/calculatePosition";
import { Assignee, getColor } from "@/models/assignee";
import { indexesToLabels } from "@/models/labels";
import { DefaultStatus, Status } from "@/models/status";
import { Task } from "@/models/task";
import { zip } from "@/utils";
import { Command } from "@/vim/commands";
import { Mode, inputtingFilterModes, inputtingModes } from "@/vim/mode";
import { ViewMode } from "@/vim/viewMode";
import { List } from "immutable";
import { useContext, useEffect } from "react";
import ReactFlow, {
  Edge,
  MarkerType,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import NormalNode from "./normalNode";

const nodeTypes = {
  normalNode: NormalNode,
};

type TaskGraphProps = {
  serialInput: string;
  viewMode: ViewMode;
  command: Command;
};

function borderAndPadding(
  status: Status,
  isSelected: boolean,
  color: string | null
): [string, string] {
  if (isSelected) {
    return ["3px solid var(--accent)", "0px"];
  }
  if (status === DefaultStatus.Working) {
    if (color == null) {
      return ["", "3px"];
    }
    return [`3px solid ${color}`, "0px"];
  }
  return ["", "3px"];
}

function boxShadow(
  status: Status,
  isSelected: boolean,
  color: string | null
): string {
  if (!isSelected) {
    return "";
  }
  if (status === DefaultStatus.Working) {
    if (color == null) {
      return "";
    }
    return `inset 0 0 0 2px ${color}`;
  }
  return "";
}

function createNodesAndEdgesFromTasks(
  tasks: List<Task>,
  assignees: Set<Assignee>,
  serialInput: string,
  mode: Mode
): [Node[], Edge[]] {
  const labels = indexesToLabels(tasks.size);
  const nodes = zip(tasks.toJS(), labels).map(([task, label]) => {
    const color =
      task.assignee == null ? null : getColor(assignees, task.assignee);
    const [border, padding] = borderAndPadding(
      task.status,
      task.isSelected,
      color
    );

    return {
      id: task.id,
      data: {
        title: task.name,
        label,
        serialInput,
        mode,
        assignee: task.assignee,
        color,
      },
      position: { x: 0, y: 0 },
      connectable: false,
      type: "normalNode",
      selected: task.isSelected,
      style: {
        border,
        padding,
        boxShadow: boxShadow(task.status, task.isSelected, color),
        background:
          task.status === DefaultStatus.Done
            ? "var(--inactive)"
            : "var(--active)",
      },
    };
  });

  const edges = (tasks.toJS() as Task[]).flatMap((task) =>
    task.to.map((targetId) => {
      const color = task.isSelected ? "var(--accent)" : "var(--active)";
      return {
        id: `e${task.id}-${targetId}`,
        source: task.id,
        target: targetId,
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: color,
        },
        style: {
          strokeWidth: 2,
          stroke: color,
        },
      };
    })
  );
  return [nodes, edges];
}

function BaseNewTaskGraph({ serialInput, viewMode, command }: TaskGraphProps) {
  const { filteredTasks } = useContext(MainContext);
  const { assignees } = useContext(GlobalContext);
  const { fitView } = useReactFlow();
  const { mode } = useContext(MainContext);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const [newNodes, newEdges] = createLayoutedNodeAndEdges(
      ...createNodesAndEdgesFromTasks(
        filteredTasks,
        assignees,
        serialInput,
        mode
      ),
      viewMode
    );
    setNodes(newNodes);
    setEdges(newEdges);
    if (
      mode === Mode.NodeSelecting ||
      inputtingModes.flat().includes(mode) ||
      inputtingFilterModes.flat().includes(mode) ||
      command === Command.ToTile ||
      command === Command.ToGraph ||
      command === Command.ConfirmFilterEdit
    ) {
      setTimeout(() => {
        fitView({
          minZoom: 1,
          maxZoom: 1,
          nodes: newNodes.filter((node) => node.selected),
        });
      }, 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filteredTasks,
    setNodes,
    setEdges,
    serialInput,
    mode,
    command,
    fitView,
    viewMode,
  ]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
    ></ReactFlow>
  );
}

export default function TaskGraph({
  serialInput,
  viewMode,
  command,
}: TaskGraphProps) {
  return (
    <div className="task-graph">
      <ReactFlowProvider>
        <BaseNewTaskGraph
          serialInput={serialInput}
          viewMode={viewMode}
          command={command}
        />
      </ReactFlowProvider>
    </div>
  );
}
