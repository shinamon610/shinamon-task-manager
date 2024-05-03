import { GlobalContext } from "@/contexts/globalContext";
import { MainContext } from "@/contexts/mainContext";
import { createLayoutedNodeAndEdges } from "@/lib/calculatePosition";
import { getNodeBorderStyle } from "@/lib/layoutUtils";
import { Assignee, getColor } from "@/models/assignee";
import { indexesToLabels } from "@/models/labels";
import { DefaultStatus } from "@/models/status";
import { Task } from "@/models/task";
import { zip } from "@/utils";
import { Command, panCommands } from "@/vim/commands";
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
  refresh: boolean;
};

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
        ...getNodeBorderStyle(assignees, task),
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

function BaseNewTaskGraph({
  serialInput,
  viewMode,
  command,
  refresh,
}: TaskGraphProps) {
  const { filteredTasks } = useContext(MainContext);
  const { assignees } = useContext(GlobalContext);
  const { fitView, zoomIn, zoomOut, getZoom, getViewport, setViewport } =
    useReactFlow();
  const { mode, zoom, setZoom } = useContext(MainContext);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const delaySetZoom = () => {
    setTimeout(() => {
      setZoom(getZoom());
    }, 300);
  };

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
    if (command === Command.ZoomIn) {
      zoomIn();
      delaySetZoom();
    }
    if (command === Command.ZoomOut) {
      zoomOut();
      delaySetZoom();
    }
    if (panCommands.includes(command)) {
      const viewPort = getViewport();
      setViewport(
        {
          ...viewPort,
          x:
            viewPort.x +
            (command === Command.PanLeft
              ? +100
              : command === Command.PanRight
                ? -100
                : 0),
          y:
            viewPort.y +
            (command === Command.PanUp
              ? +100
              : command === Command.PanDown
                ? -100
                : 0),
        },
        { duration: 100 }
      );
    }
    if (
      mode === Mode.NodeSelecting ||
      inputtingModes.flat().includes(mode) ||
      inputtingFilterModes.flat().includes(mode) ||
      command === Command.ToTile ||
      command === Command.ToGraph ||
      command === Command.ConfirmFilterEdit ||
      command === Command.ShowSources
    ) {
      setTimeout(() => {
        fitView({
          minZoom: zoom,
          maxZoom: zoom,
          duration: 100,
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
    refresh,
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
  refresh,
}: TaskGraphProps) {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <BaseNewTaskGraph
          serialInput={serialInput}
          viewMode={viewMode}
          command={command}
          refresh={refresh}
        />
      </ReactFlowProvider>
    </div>
  );
}
