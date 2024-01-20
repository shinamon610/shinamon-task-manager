import { createLayoutedNodeAndEdges } from "@/lib/calculatePosition";
import { Assignee, getColor } from "@/models/assignee";
import { indexesToLabels } from "@/models/labels";
import { DefaultStatus, Status } from "@/models/status";
import { Task } from "@/models/task";
import { zip } from "@/utils";
import { Command } from "@/vim/commands";
import { Mode } from "@/vim/mode";
import { ViewMode } from "@/vim/viewMode";
import { useEffect } from "react";
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
  tasks: Task[];
  assignees: Set<Assignee>;
  serialInput: string;
  mode: Mode;
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
  tasks: Task[],
  assignees: Set<Assignee>,
  serialInput: string,
  mode: Mode
): [Node[], Edge[]] {
  const labels = indexesToLabels(tasks.length);
  const nodes = zip(tasks, labels).map(([task, label]) => {
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

  const edges = tasks.flatMap((task) =>
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

function BaseNewTaskGraph({
  tasks,
  assignees,
  serialInput,
  mode,
  viewMode,
  command,
}: TaskGraphProps) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const [newNodes, newEdges] = createLayoutedNodeAndEdges(
      ...createNodesAndEdgesFromTasks(tasks, assignees, serialInput, mode),
      viewMode
    );
    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(() => {
      fitView();
    }, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tasks,
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
  tasks,
  assignees,
  serialInput,
  mode,
  viewMode,
  command,
}: TaskGraphProps) {
  return (
    <div className="task-graph">
      <ReactFlowProvider>
        <BaseNewTaskGraph
          tasks={tasks}
          assignees={assignees}
          serialInput={serialInput}
          mode={mode}
          viewMode={viewMode}
          command={command}
        />
      </ReactFlowProvider>
    </div>
  );
}
