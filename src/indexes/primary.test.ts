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
    expect(i.get("1")).toBe(a);
    expect(i.get("2")).toBe(b);
    expect(i.get("3")).toBe(c);
  });

  test("getAll", () => {
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
    expect(i.getAll()[0]).toBe(a);
    expect(i.getAll()[1]).toBe(b);
    expect(i.getAll()[2]).toBe(c);
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
    expect(i.get("1")).toBe(a);
    expect(i.get("2")).toBe(b);
    expect(i.get("3")).toBe(c);

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    const arr = i.getAll();
    expect(arr[0]).toBe(a);
    expect(arr[1]).toBe(b);
    expect(arr[2]).toBe(c);
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
    expect(i.get("1")).toBe(a);
    expect(i.get("2")).toBe(b);
    expect(i.get("3")).toBe(c);

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    const arr = i.getAll();
    expect(arr[0]).toBe(a);
    expect(arr[1]).toBe(b);
    expect(arr[2]).toBe(c);
  });
});
