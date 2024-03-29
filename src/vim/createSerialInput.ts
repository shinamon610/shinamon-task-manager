import { createLabelSelectedMatrix, indexesToLabels } from "@/models/labels";
import { Task } from "@/models/task";
import { idf, zip } from "@/utils";
import { List } from "immutable";
import { Command } from "./commands";

export function createSerialInput(
  key: string,
  command: Command,
  serialInput: string,
  tasks: List<Task>
): string {
  if (command !== Command.SelectTaskNode) {
    return "";
  }
  const oldM = createLabelSelectedMatrix(
    indexesToLabels(tasks.size),
    serialInput
  );
  const newM = createLabelSelectedMatrix(
    indexesToLabels(tasks.size),
    serialInput + key
  );
  return hasDiff(oldM, newM) ? serialInput + key : serialInput;
}

function hasDiff(a: boolean[][], b: boolean[][]): boolean {
  return !zip(a, b)
    .map(([aa, bb]) => {
      return zip(aa, bb)
        .map(([aaa, bbb]) => {
          return aaa === bbb;
        })
        .every(idf);
    })
    .every(idf);
}
