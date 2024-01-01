export enum Status {
  Working = "Working",
  Pending = "Pending",
  Done = "Done",
}

export function loadInitialStatusOptions(): Set<Status> {
  return new Set(Object.values(Status));
}
