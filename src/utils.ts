export function zip<T, S>(a: T[], b: S[]): [T, S][] {
  const res: [T, S][] = [];
  for (let i = 0; i < a.length; i++) {
    res.push([a[i], b[i]]);
  }
  return res;
}

export function idf<T>(x: T) {
  return x;
}

export function combPair<T>(a: T[][], b: T[]): T[][] {
  return a.flatMap((aa) => {
    return b.map((bb) => {
      return aa.concat(bb);
    });
  });
}

export function flattenStrings(targets: string[][]): string[] {
  return targets.map((target) => target.reduce((a, b) => a + b, ""));
}

export function getNextItem<T>(items: T[][], x: number, y: number): T {
  if (items[x].length - 1 > y) {
    return items[x][y + 1];
  }
  return items[(x + 1) % items.length][0];
}

export function getPrevItem<T>(items: T[][], x: number, y: number): T {
  if (y == 0) {
    const prevx = (x - 1 + items.length) % items.length;
    return items[prevx][items[prevx].length - 1];
  }
  return items[x][y - 1];
}

export function flatten<T>(x: T[][]): T[] {
  return x.reduce((a, b) => {
    return a.concat(b);
  }, []);
}
