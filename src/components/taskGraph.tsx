import { Status } from "@/models/status";
import { Option } from "./selectBox";
import { Assignee } from "@/models/assignee";
import { getColor } from "@/models/assignee";
import { zip } from "@/utils";
import Dagre from "@dagrejs/dagre";
import React, { useEffect } from "react";
import { MarkerType } from "reactflow";
import ReactFlow, {
  Node,
  Edge,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Position,
} from "reactflow";
import { Task } from "@/models/task";
import "reactflow/dist/style.css";
import NormalNode from "./normalNode";
import { Mode } from "@/vim/mode";
import { indexesToLabels } from "@/models/labels";
import { Command } from "@/vim/commands";

const nodeTypes = {
  normalNode: NormalNode,
};

type LayoutOptions = {
  direction: "TB" | "LR";
};

function measureTextWidth(text: string, fontSize: number = 10): number {
  if (typeof document !== "undefined") {
    // 仮想のCanvas要素を作成
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
      // フォントサイズとフォントファミリを設定（フォントファミリは適宜変更してください）
      context.font = `${fontSize}px Arial`;

      // 文字列の幅を計測
      const metrics = context.measureText(text);
      return metrics.width;
    }
  }
  return 0;
}

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  const width = Math.max(
    ...nodes.map((node) => measureTextWidth(node.data.title)),
    100
  );
  nodes.forEach((node) => {
    const { id } = node;
    const height = 50;

    g.setNode(id, { width, height });
  });
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const nodeWithPosition = g.node(node.id);
      node.targetPosition = Position.Left;
      node.sourcePosition = Position.Right;

      node.position = {
        x: nodeWithPosition.x * 1,
        y: nodeWithPosition.y * 1,
      };
      return node;
    }),
    edges,
  };
};

type TaskGraphProps = {
  tasks: Task[];
  assignees: Set<Assignee>;
  serialInput: string;
  mode: Mode;
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
  if (status === Status.Working) {
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
  if (status === Status.Working) {
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
          task.status === Status.Done ? "var(--inactive)" : "var(--active)",
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
  command,
}: TaskGraphProps) {
  const { setViewport, zoomIn, zoomOut, fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (tasks.length === 0) {
      return;
    }
    const layouted = getLayoutedElements(
      ...createNodesAndEdgesFromTasks(tasks, assignees, serialInput, mode),
      { direction: "LR" }
    );
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
    setTimeout(() => {
      fitView();
    }, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, setNodes, setEdges, serialInput, mode, command, fitView]);

  useEffect(() => {
    if (command === Command.Fit) {
      setTimeout(() => {
        fitView();
      }, 10);
    }
  }, [command, mode, fitView]);
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
          command={command}
        />
      </ReactFlowProvider>
    </div>
  );
}
