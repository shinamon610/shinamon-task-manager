import { Option } from "@/components/selectBox";
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

export function extractAssigneeOptions(tasks: Task[]): Set<Option<Assignee>> {
  return new Set(
    tasks
      .map((task) => ({ value: task.assignee, label: task.assignee }))
      .filter((option) => option.value != null) as Option<Assignee>[]
  );
}

export function getColor(
  options: Set<Option<Assignee>>,
  assignee: Assignee
): Color {
  const assignees = new Set<Assignee>(
    Array.from(options).map(({ value }) => value)
  );
  const index = Array.from(assignees.add(assignee))
    .sort()
    .findIndex((a) => a === assignee);
  return colorlist[index % colorlist.length];
}
