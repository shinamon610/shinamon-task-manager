import moment from "moment";
export type Status = DefaultStatus | NotStatus | Done;
export type StatusLabel = DefaultStatusLabel | NotStatusLabel;

export const AllDefaultStatusLabel = ["Working", "Pending", "Done"] as const;
export const AllNotStatusLabel = [
  "Not Working",
  "Not Pending",
  "Not Done",
] as const;
export type DefaultStatusLabel = (typeof AllDefaultStatusLabel)[number];
export type NotStatusLabel = (typeof AllNotStatusLabel)[number];

type DefaultStatus = { type: Exclude<DefaultStatusLabel, "Done"> };
type NotStatus = { type: NotStatusLabel };
export type Done = { type: "Done"; date: moment.Moment };

export function toDefaultStatusLabel(
  status: NotStatusLabel
): DefaultStatusLabel {
  switch (status) {
    case "Not Working":
      return "Working";
    case "Not Pending":
      return "Pending";
    case "Not Done":
      return "Done";
  }
}

export function loadInitialStatusLabel(): Set<DefaultStatusLabel> {
  return new Set(AllDefaultStatusLabel);
}

export function loadInitialAllStatus(): Set<StatusLabel> {
  return new Set([...AllDefaultStatusLabel, ...AllNotStatusLabel]);
}

export function toStatus(statusLabel: StatusLabel): Status {
  if (statusLabel == "Done") {
    return { type: "Done", date: moment() };
  }
  return { type: statusLabel };
}
