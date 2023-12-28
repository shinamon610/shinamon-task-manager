import { Option } from "@/components/selectBox";

export type Assignee = string;
export function loadInitialAssigneeOptions(
  filePath: string
): Set<Option<Assignee>> {
  return new Set([{ value: "shinamon", label: "shinamon" }]);
}
