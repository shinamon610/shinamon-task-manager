import { Task } from "@/models/task";
import { PriorityQueue } from "./priorityQueue";

// keyはtask.idで、valueは[task.to,task.priority]
export type TopologicalSortable = Map<string, [string[], number]>;

export function toposortWithPriority(tasks: TopologicalSortable): string[] {
  // init inDegree.
  const inDegrees = new Map<string, number>();
  tasks.forEach((_, id) => inDegrees.set(id, 0));

  // compute inDegree
  tasks.forEach(([to, _]) =>
    to.forEach((id) => {
      const old = inDegrees.get(id)!;
      inDegrees.set(id, (old || 0) + 1);
    })
  );

  // fst is priority, snd is id
  const heap = new PriorityQueue((a: [number, string], b: [number, string]) => {
    return a[0] < b[0];
  });
  inDegrees.forEach((inDegree, id) => {
    if (inDegree === 0) heap.push([tasks.get(id)![1], id]);
  });

  const result: string[] = [];
  while (!heap.isEmpty()) {
    const [_, id] = heap.pop()!;
    result.push(id);
    tasks.get(id)![0].forEach((id) => {
      const inDegree = inDegrees.get(id)! - 1;
      inDegrees.set(id, inDegree - 1);
      if (inDegree === 0) heap.push([tasks.get(id)![1], id]);
    });
  }

  return result;
}

export function toposort(tasks: Task[]): Task[] {
  const sortableTasks: TopologicalSortable = new Map();
  tasks.forEach((task) => {
    sortableTasks.set(task.id, [task.to, task.priority]);
  });
  return toposortWithPriority(sortableTasks).map(
    (id) => tasks.find((task) => task.id === id)!
  );
}
