import { Command } from "./commands";
export function preventKey(event: KeyboardEvent, command: Command) {
  if (command !== Command.Nothing) {
    event.preventDefault();
  }
}
