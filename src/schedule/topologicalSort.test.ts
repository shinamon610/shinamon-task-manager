import { topologicalSort, TopologicalSortable } from "./topologicalSort";

test("topologicalSort test1", () => {
  const tasks: TopologicalSortable[] = [
    { id: "task1", to: [] },
    { id: "task2", to: ["task1"] },
    { id: "task3", to: ["task2"] },
  ];
  // task3 -> task2 -> task1

  const sortedTasks = topologicalSort(tasks);
  expect(sortedTasks).toEqual(["task3", "task2", "task1"]);
});

test("topologicalSort test2", () => {
  const tasks: TopologicalSortable[] = [
    { id: "task1", to: [] },
    { id: "task2", to: ["task1"] },
    { id: "task3", to: ["task1"] },
    { id: "task4", to: ["task2", "task3"] },
    { id: "task5", to: ["task1", "task3", "task4"] },
    { id: "task6", to: ["task5"] },
  ];
  // task6 -> task5 -> task4 -> task2 -> task1
  // task6 -> task5 -> task4 -> task3 -> task1
  // task6 -> task5 -> task1
  // task6 -> task5 -> task3

  const sortedTasks = topologicalSort(tasks);
  expect(sortedTasks).toEqual([
    "task6",
    "task5",
    "task4",
    "task3",
    "task2",
    "task1",
  ]);
});
