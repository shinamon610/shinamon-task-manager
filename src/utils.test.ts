import { flatten } from "./utils";

test("flatten test", () => {
  const tasks = [
    [1, 2, 3],
    [4, 5, 6],
  ];

  expect(flatten(tasks)).toEqual([1, 2, 3, 4, 5, 6]);
});
