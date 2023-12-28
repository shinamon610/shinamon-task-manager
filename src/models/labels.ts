import { combPair, flattenStrings } from "@/utils";
import { selectString } from "@/vim/commands";

export function createLabelSelectedMatrix(
  labels: string[],
  serialInput: string
): boolean[][] {
  return labels.map((label) => {
    return createLabelSelectArray(label, serialInput);
  });
}

export function createLabelSelectArray(
  label: string,
  serialInput: string
): boolean[] {
  let shouldSelect = true;
  return label.split("").map((l, i) => {
    if (shouldSelect) {
      if (l !== serialInput[i]) {
        shouldSelect = false;
      }
      return shouldSelect;
    }
    return false;
  });
}

export function indexesToLabels(totalTasks: number): string[] {
  if (totalTasks === 0) {
    return [];
  }
  const labelLength = countLabelLength(totalTasks, selectString.length);
  return createLabels(selectString, labelLength).slice(0, totalTasks);
}

export function countLabelLength(
  totalTasks: number,
  selectStringLength: number
): number {
  let num = 1;
  let totalNum = selectStringLength;
  while (totalTasks > totalNum) {
    num += 1;
    totalNum *= selectStringLength;
  }
  return num;
}
export function createLabels(
  selectString: string,
  labelLength: number
): string[] {
  const oneLetters = selectString.split("");
  const sources = Array.from({ length: labelLength }, () => oneLetters);
  const reduced = sources.reduce(
    (res: string[][], aa: string[]) => combPair(res, aa),
    [[]]
  );
  const res = flattenStrings(reduced);
  return res;
}
