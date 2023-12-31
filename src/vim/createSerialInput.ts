import { Task } from "@/models/task";
import { indexesToLabels, createLabelSelectedMatrix } from "@/models/labels";
import { Command } from "./commands";
import { zip } from "@/utils";
import { idf } from "@/utils";

export function createSerialInput(
  key: string,
  command: Command,
  serialInput: string,
  tasks: Task[]
): string {
  if (command !== Command.SelectTaskNode) {
    return "";
  }
  const oldM = createLabelSelectedMatrix(
    indexesToLabels(tasks.length),
    serialInput
  );
  const newM = createLabelSelectedMatrix(
    indexesToLabels(tasks.length),
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
