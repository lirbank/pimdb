import { describe, expect, test } from "vitest";
import { PrimaryIndex } from "./primary";

interface TestDoc {
  id: string;
  name: string;
}

describe("primary index", () => {
  test("get", () => {
    const i = new PrimaryIndex<TestDoc>();

    const a = { id: "1", name: "a" };
    const b = { id: "2", name: "b" };
    const c = { id: "3", name: "c" };

    i.insert(a);
    i.insert(b);
    i.insert(c);

    expect(i.get("1")).toStrictEqual({ id: "1", name: "a" });
    expect(i.get("2")).toStrictEqual({ id: "2", name: "b" });
    expect(i.get("3")).toStrictEqual({ id: "3", name: "c" });

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    expect(i.get("1") === a).toBe(true);
    expect(i.get("2") === b).toBe(true);
    expect(i.get("3") === c).toBe(true);
  });

  test("insert", () => {
    const i = new PrimaryIndex<TestDoc>();

    const a = { id: "1", name: "a" };
    const b = { id: "2", name: "b" };
    const c = { id: "3", name: "c" };

    i.insert(a);
    i.insert(b);
    i.insert(c);

    expect(i.getAll()).toStrictEqual([
      { id: "1", name: "a" },
      { id: "2", name: "b" },
      { id: "3", name: "c" },
    ]);

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    expect(i.get("1") === a).toBe(true);
    expect(i.get("2") === b).toBe(true);
    expect(i.get("3") === c).toBe(true);

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    const arr = i.getAll();
    expect(arr[0] === a).toBe(true);
    expect(arr[1] === b).toBe(true);
    expect(arr[2] === c).toBe(true);
  });

  test("update", () => {
    const i = new PrimaryIndex<TestDoc>();

    const a = { id: "1", name: "a" };
    const b = { id: "2", name: "b" };
    const c = { id: "3", name: "c" };

    i.insert(a);
    i.insert(b);
    i.insert(c);

    expect(i.getAll()).toStrictEqual([
      { id: "1", name: "a" },
      { id: "2", name: "b" },
      { id: "3", name: "c" },
    ]);

    i.update({ id: "1", name: "x" });
    expect(i.getAll()).toStrictEqual([
      { id: "1", name: "x" },
      { id: "2", name: "b" },
      { id: "3", name: "c" },
    ]);

    i.update({ id: "2", name: "y" });
    expect(i.getAll()).toStrictEqual([
      { id: "1", name: "x" },
      { id: "2", name: "y" },
      { id: "3", name: "c" },
    ]);

    i.update({ id: "3", name: "z" });
    expect(i.getAll()).toStrictEqual([
      { id: "1", name: "x" },
      { id: "2", name: "y" },
      { id: "3", name: "z" },
    ]);

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    expect(i.get("1") === a).toBe(true);
    expect(i.get("2") === b).toBe(true);
    expect(i.get("3") === c).toBe(true);

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    const arr = i.getAll();
    expect(arr[0] === a).toBe(true);
    expect(arr[1] === b).toBe(true);
    expect(arr[2] === c).toBe(true);
  });
});
