import { Assignee, getColor } from "@/models/assignee";
import { indexesToLabels } from "@/models/labels";
import { DefaultStatus, Status } from "@/models/status";
import { Task } from "@/models/task";
import { zip } from "@/utils";
import { Command } from "@/vim/commands";
import { Mode } from "@/vim/mode";
import Dagre from "@dagrejs/dagre";
import { useEffect } from "react";
import ReactFlow, {
  Edge,
  MarkerType,
  Node,
  Position,
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
      context.font = `${fontSize}px sans-serif`;

      // 文字列の幅を計測
      const metrics = context.measureText(text);
      return metrics.width;
    }
  }
  return 0;
}

function calculatePosition(
  widths: number[],
  height: number
): [number, number][] {
  if (widths.length === 0) {
    return [];
  }
  const windowWidth = window.innerWidth / 2;
  const res: [number, number][] = [[0, 0]];
  widths.forEach((width, i) => {
    if (res[i][0] + width <= windowWidth) {
      res.push([width + res[i][0], res[i][1]]);
    } else {
      res.push([0, res[i][1] + height]);
    }
  });

  return res;
}

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): { nodes: Node[]; edges: Edge[] } {
  if (nodes.length === 0) {
    return { nodes: [], edges: [] };
  }
  const minWidth = 100;
  const widths = nodes.map((node) =>
    Math.max(measureTextWidth(node.data.title), minWidth)
  );
  const height = 50;

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  const width = Math.max(...widths);

  nodes.forEach((node) => g.setNode(node.id, { width, height }));
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));

  // nodesもedgesも0だとエラーになる。
  Dagre.layout(g);

  // edgeがない場合、tile上に並べる
  if (edges.length === 0) {
    return {
      nodes: zip(calculatePosition(widths, height), nodes).map(
        ([[x, y], node]) => {
          node.position = { x, y };
          return node;
        }
      ),
      edges: [],
    };
  }

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
}

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
  command,
}: TaskGraphProps) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
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
