import { Option } from "@/components/selectBox";

export enum DefaultStatus {
  Working = "Working",
  Pending = "Pending",
  Done = "Done",
}
type UserInputStatus = string;
export type Status = DefaultStatus | UserInputStatus;
export function loadInitialStatusOptions(
  filePath: string
): Set<Option<Status>> {
  return new Set(
    Object.keys(DefaultStatus).map((key) => ({ value: key, label: key }))
  );
}
