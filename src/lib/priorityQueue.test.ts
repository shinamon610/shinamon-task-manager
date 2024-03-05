import { PriorityQueue } from "./priorityQueue";

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

test("topologicalSort test1", () => {
  const pq = new PriorityQueue<number>((a, b) => a < b);
  const res1 = [];
  const res2 = [];

  const length = 115;
  for (let i = 0; i < length; i++) {
    const x = getRandomInt(100);
    pq.push(x);
    res1.push(x);
  }

  for (let i = 0; i < length; i++) {
    res2.push(pq.pop());
  }

  expect(res1.sort((a, b) => a - b)).toEqual(res2);
});
