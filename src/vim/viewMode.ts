import { Command } from "./commands";
export enum ViewMode {
  Graph,
  Tile,
}

export function createViewMode(command: Command, viewMode: ViewMode): ViewMode {
  if (command === Command.ToGraph) {
    return ViewMode.Graph;
  }
  if (command === Command.ToTile) {
    return ViewMode.Tile;
  }
  return viewMode;
}
