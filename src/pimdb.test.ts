import { describe, expect, test } from "vitest";

describe("sort", () => {
  test("normal", () => {
    const x = [1, 5, 4, 2, 3];
    x.sort((a, b) => {
      return a - b;
    });

    expect(x).toEqual([1, 2, 3, 4, 5]);
  });

  test("reverse", () => {
    const x = [1, 5, 4, 2, 3];
    x.sort((a, b) => {
      return a - b;
    }).reverse();

    expect(x).toEqual([5, 4, 3, 2, 1]);
  });
});
