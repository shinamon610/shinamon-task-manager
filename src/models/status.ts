import { Option } from "@/components/selectBox";

export enum Status {
  Working = "Working",
  Pending = "Pending",
  Done = "Done",
}

export function loadInitialStatusOptions(): Set<Option<Status>> {
  return new Set(
    Object.values(Status).map((key) => ({ value: key, label: key.toString() }))
  );
}
