import { Assignee, getColor } from "@/models/assignee";
import { StatusLabel } from "@/models/status";

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
  statusLabel: StatusLabel,
  isSelected: boolean,
  color: string
): string {
  if (!isSelected) {
    return "";
  }
  if (statusLabel === "Working" && color !== "") {
    return `inset 0 0 0 2px ${color}`;
  }
  return "";
}

function isColoredAndColor(
  statusLabel: StatusLabel,
  isSelected: boolean,
  color: string
): [boolean, string] {
  if (isSelected) {
    return [true, AccentColor];
  }
  if (statusLabel === "Working") {
    return [true, color];
  }
  return [false, ""];
}

export function getNodeBorderStyle(
  assignees: Set<Assignee>,
  task: {
    assignee: Assignee | null;
    statusLabel: StatusLabel;
    isSelected: boolean;
  }
): {
  border: string;
  padding: string;
  boxShadow: string;
} {
  const innerColor =
    task.assignee == null ? "" : getColor(assignees, task.assignee);
  const [isSelected, outerColor] = isColoredAndColor(
    task.statusLabel,
    task.isSelected,
    innerColor
  );
  const { border, padding } = getSelectedStyle(isSelected, outerColor);
  return {
    border,
    padding,
    boxShadow: boxShadow(task.statusLabel, task.isSelected, innerColor),
  };
}
