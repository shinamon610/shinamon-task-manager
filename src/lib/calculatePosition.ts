import { zip } from "@/utils";
import Dagre from "@dagrejs/dagre";
import { Edge, Node } from "reactflow";

function measureTextWidth(text: string, fontSize: number = 10): number {
  if (typeof document !== "undefined") {
    // 仮想のCanvas要素を作成
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
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

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[]
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
  g.setGraph({ rankdir: "LR" });

  const width = Math.max(...widths);

  nodes.forEach((node) => g.setNode(node.id, { width, height }));
  console.log("b", edges[0]);
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));

  // nodesもedgesも0だとエラーになる。
  Dagre.layout(g);
  console.log("a", edges[0]);

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
      node.position = {
        x: nodeWithPosition.x * 1,
        y: nodeWithPosition.y * 1,
      };
      return node;
    }),
    edges,
  };
}
