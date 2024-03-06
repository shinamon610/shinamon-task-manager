import { Assignee, getColor } from "@/models/assignee";
import { DefaultStatus, Status } from "@/models/status";

export const AccentColor = "var(--accent)";

export function getSelectedStyle(
  isSelected: boolean,
  color: string
): {
  padding: string;
  border: string;
} {
  return isSelected
    ? { border: `3px solid ${color}`, padding: "0px" }
    : { border: "", padding: "3px" };
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

function isColoredAndColor(
  status: Status,
  isSelected: boolean,
  color: string | null
): [boolean, string] {
  if (isSelected) {
    return [true, AccentColor];
  }
  if (status === DefaultStatus.Working) {
    return [color !== null, color ?? ""];
  }
  return [false, ""];
}

export function getNodeBorderStyle(
  assignees: Set<Assignee>,
  task: { assignee: Assignee | null; status: Status; isSelected: boolean }
): {
  border: string;
  padding: string;
  boxShadow: string;
} {
  const color =
    task.assignee == null ? null : getColor(assignees, task.assignee);
  const [isSelected, outerColor] = isColoredAndColor(
    task.status,
    task.isSelected,
    color
  );
  const { border, padding } = getSelectedStyle(isSelected, outerColor);
  return {
    border,
    padding,
    boxShadow: boxShadow(task.status, task.isSelected, color),
  };
}
