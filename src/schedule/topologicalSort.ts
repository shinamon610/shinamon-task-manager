export type TopologicalSortable = {
  id: string;
  to: string[]; // 依存するタスクのIDのリスト
};

export const topologicalSort = (tasks: TopologicalSortable[]): string[] => {
  const graph = new Map<string, string[]>();
  const visited = new Set<string>();
  const result: string[] = [];

  // グラフの構築
  tasks.forEach((task) => {
    graph.set(task.id, task.to);
  });

  const visit = (taskId: string) => {
    if (visited.has(taskId)) return;
    visited.add(taskId);

    const dependencies = graph.get(taskId) || [];
    dependencies.forEach(visit);

    result.push(taskId);
  };

  tasks.forEach((task) => visit(task.id));

  return result.reverse();
};
