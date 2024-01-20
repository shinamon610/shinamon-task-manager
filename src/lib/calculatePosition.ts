import { zip } from "@/utils";
import { ViewMode } from "@/vim/viewMode";
import Dagre from "@dagrejs/dagre";
import { Edge, Node } from "reactflow";

function measureTextWidth(text: string): number {
  if (typeof document !== "undefined") {
    // 仮想のCanvas要素を作成
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const fontSize = 10;

    if (context) {
      context.font = `${fontSize}px sans-serif`;

      // 文字列の幅を計測
      const metrics = context.measureText(text);
      return metrics.width;
    }
  }
  return 0;
}

function calculateTilePosition(
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

function calculateGraphPosition(
  nodes: Node[],
  edges: Edge[],
  width: number,
  height: number
): [number, number][] {
  if (nodes.length === 0) {
    return [];
  }
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR" });

  nodes.forEach((node) => g.setNode(node.id, { width, height }));
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));

  // nodesもedgesも0だとエラーになる。
  Dagre.layout(g);

  return nodes.map((node) => {
    const { x, y } = g.node(node.id);
    return [x, y];
  });
}

export function createLayoutedNodeAndEdges(
  nodes: Node[],
  edges: Edge[],
  viewMode: ViewMode
): [Node[], Edge[]] {
  const height = 50;
  const minWidth = 100;
  const widths = nodes.map((node) =>
    Math.max(measureTextWidth(node.data.title), minWidth)
  );
  const isTile = viewMode === ViewMode.Tile || edges.length === 0;
  const positions = isTile
    ? calculateTilePosition(widths, height)
    : calculateGraphPosition(nodes, edges, Math.max(...widths), height);
  return [
    zip(nodes, positions).map(([node, [x, y]]) => {
      node.position = { x, y };
      return node;
    }),
    isTile ? [] : edges,
  ];
}
