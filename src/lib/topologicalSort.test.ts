import { TopologicalSortable, toposortWithPriority } from "./topologicalSort";

test.each([
  [1, 1, 1],
  [1, 2, 3],
  [2, 1, 3],
  [2, 3, 1],
  [3, 1, 2],
  [3, 2, 1],
])("toposortWithPriority test1", (a, b, c) => {
  const tasks: TopologicalSortable = new Map();
  tasks.set("task1", [[], a]);
  tasks.set("task2", [["task1"], b]);
  tasks.set("task3", [["task2"], c]);
  // task3 -> task2 -> task1

  const sortedTasks = toposortWithPriority(tasks);
  expect(sortedTasks).toEqual(["task3", "task2", "task1"]);
});

test("toposortWithPriority test2", () => {
  const tasks: TopologicalSortable = new Map();
  tasks.set("a", [["b", "c"], 1]);
  tasks.set("b", [[], 1]);
  tasks.set("c", [["d", "e"], 1]);
  tasks.set("d", [[], 1]);
  tasks.set("e", [[], 1]);

  const sortedTasks = toposortWithPriority(tasks);
  expect(sortedTasks).toEqual(["a", "b", "c", "d", "e"]);
});

test("toposortWithPriority test3", () => {
  const tasks: TopologicalSortable = new Map();
  tasks.set("a", [["b", "c"], 1]);
  tasks.set("b", [[], 2]);
  tasks.set("c", [["d", "e"], 3]);
  tasks.set("d", [[], 4]);
  tasks.set("e", [[], 1]);

  const sortedTasks = toposortWithPriority(tasks);
  expect(sortedTasks).toEqual(["a", "c", "e", "b", "d"]);
});
