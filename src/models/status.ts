export type Status = DefaultStatus | NotStatus;

export const AllDefaultStatus = ["Working", "Pending", "Done"] as const;
export const AllNotStatus = ["Not Working", "Not Pending", "Not Done"] as const;

export type DefaultStatus = (typeof AllDefaultStatus)[number];

export type NotStatus = (typeof AllNotStatus)[number];

export function toDefaultStatus(status: NotStatus): DefaultStatus {
  switch (status) {
    case "Not Working":
      return "Working";
    case "Not Pending":
      return "Pending";
    case "Not Done":
      return "Done";
  }
}

export function loadInitialStatus(): Set<Status> {
  return new Set(AllDefaultStatus);
}

export function loadInitialAllStatus(): Set<Status> {
  return new Set([...AllDefaultStatus, ...AllNotStatus]);
}
