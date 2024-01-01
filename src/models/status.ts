export type Status = DefaultStatus | NotStatus;

export enum DefaultStatus {
  Working = "Working",
  Pending = "Pending",
  Done = "Done",
}

export enum NotStatus {
  NotWorking = "Not Working",
  NotPending = "Not Pending",
  NotDone = "Not Done",
}

export function loadInitialStatusOptions(): Set<Status> {
  return new Set(Object.values(DefaultStatus));
}
