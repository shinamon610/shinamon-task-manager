import { Task } from "./task";

export type Assignee = string;
type Color = string;

const colorlist: Color[] = [
  "blueviolet",
  "brown",
  "Green",
  "Gold",
  "DeepPink",
  "DarkSlateBlue",
  "DarkRed",
  "DarkGreen",
  "DarkGoldenRod",
  "DarkCyan",
  "DarkBlue",
  "Crimson",
  "Chocolate",
  "yellow",
];

export function extractAssignees(tasks: Task[]): Set<Assignee> {
  return new Set(
    tasks
      .map((task) => task.assignee)
      .filter((assignee) => assignee != null) as Assignee[]
  );
}

export function getColor(options: Set<Assignee>, assignee: Assignee): Color {
  const index = Array.from(options.add(assignee))
    .sort()
    .findIndex((a) => a === assignee);
  return colorlist[index % colorlist.length];
}
