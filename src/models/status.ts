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

export function toDefaultStatus(status: NotStatus): DefaultStatus {
  switch (status) {
    case NotStatus.NotWorking:
      return DefaultStatus.Working;
    case NotStatus.NotPending:
      return DefaultStatus.Pending;
    case NotStatus.NotDone:
      return DefaultStatus.Done;
  }
}

export function loadInitialStatusOptions(): Set<Status> {
  return new Set(Object.values(DefaultStatus));
}

export function loadInitialAllStatusOptions(): Set<Status> {
  return new Set([
    ...Object.values(DefaultStatus),
    ...Object.values(NotStatus),
  ]);
}
