import { describe, expect, test } from "vitest";
import { PimPrimaryIndex } from "./primary";
import { Spaceship } from "../test-helpers";

describe("primary index", () => {
  test("get", () => {
    const index = new PimPrimaryIndex<Spaceship>();

    const a = { id: "1", name: "a" };
    const b = { id: "2", name: "b" };
    const c = { id: "3", name: "c" };

    index.insert(a);
    index.insert(b);
    index.insert(c);

    expect(index.get("1")).toStrictEqual({ id: "1", name: "a" });
    expect(index.get("2")).toStrictEqual({ id: "2", name: "b" });
    expect(index.get("3")).toStrictEqual({ id: "3", name: "c" });

    // The index returns the stored references, not clones
    expect(index.get("1")).toBe(a);
    expect(index.get("2")).toBe(b);
    expect(index.get("3")).toBe(c);
  });

  test("get returns undefined if the document id is not found", () => {
    const index = new PimPrimaryIndex<Spaceship>();

    index.insert({ id: "1", name: "a" });

    expect(index.get("2")).toBe(undefined);
  });

  test("index.all", () => {
    const index = new PimPrimaryIndex<Spaceship>();

    const a = { id: "0", name: "a" };
    const b = { id: "1", name: "b" };
    const c = { id: "2", name: "c" };

    index.insert(a);
    index.insert(b);
    index.insert(c);

    expect(index.all()).toStrictEqual([
      { id: "0", name: "a" },
      { id: "1", name: "b" },
      { id: "2", name: "c" },
    ]);

    // The index returns the stored references, not clones
    const arr = index.all();
    expect(arr[0]).toBe(a);
    expect(arr[1]).toBe(b);
    expect(arr[2]).toBe(c);
  });

  test("insert", () => {
    const index = new PimPrimaryIndex<Spaceship>();

    const a = { id: "1", name: "a" };
    const b = { id: "2", name: "b" };
    const c = { id: "3", name: "c" };

    expect(index.insert(a)).toBe(true);
    expect(index.insert(b)).toBe(true);
    expect(index.insert(c)).toBe(true);

    expect(index.all()).toStrictEqual([
      { id: "1", name: "a" },
      { id: "2", name: "b" },
      { id: "3", name: "c" },
    ]);

    // The index stores the same object reference as the one inserted
    expect(index.get("1")).toBe(a);
    expect(index.get("2")).toBe(b);
    expect(index.get("3")).toBe(c);
  });

  test("insert returns false if the document id is already in the index", () => {
    const index = new PimPrimaryIndex<Spaceship>();

    const a = { id: "1", name: "a" };
    index.insert(a);

    expect(index.insert({ id: "1", name: "x" })).toBe(false);

    // Verify that the document was not replaced
    expect(index.get("1")).toBe(a);
  });

  test("replace", () => {
    const index = new PimPrimaryIndex<Spaceship>();

    const a = { id: "1", name: "a" };
    const b = { id: "2", name: "b" };
    const c = { id: "3", name: "c" };

    index.insert(a);
    index.insert(b);
    index.insert(c);

    expect(index.all()).toStrictEqual([
      { id: "1", name: "a" },
      { id: "2", name: "b" },
      { id: "3", name: "c" },
    ]);

    const x = { id: "1", name: "x" };
    expect(index.replace(a, x)).toBe(true);
    expect(index.all()).toStrictEqual([
      { id: "1", name: "x" },
      { id: "2", name: "b" },
      { id: "3", name: "c" },
    ]);

    const y = { id: "2", name: "y" };
    expect(index.replace(b, y)).toBe(true);
    expect(index.all()).toStrictEqual([
      { id: "1", name: "x" },
      { id: "2", name: "y" },
      { id: "3", name: "c" },
    ]);

    const z = { id: "3", name: "z" };
    expect(index.replace(c, z)).toBe(true);
    expect(index.all()).toStrictEqual([
      { id: "1", name: "x" },
      { id: "2", name: "y" },
      { id: "3", name: "z" },
    ]);

    // Replacing swaps the stored reference for the new document
    expect(index.get("1")).toBe(x);
    expect(index.get("2")).toBe(y);
    expect(index.get("3")).toBe(z);

    // The replaced documents are not mutated
    expect(a).toStrictEqual({ id: "1", name: "a" });
    expect(b).toStrictEqual({ id: "2", name: "b" });
    expect(c).toStrictEqual({ id: "3", name: "c" });
  });

  test("replace returns false if the document id is not found", () => {
    const index = new PimPrimaryIndex<Spaceship>();

    const a = { id: "1", name: "a" };
    index.insert(a);

    expect(index.replace({ id: "2", name: "b" }, { id: "2", name: "x" })).toBe(
      false,
    );

    // Verify that the document was not added or modified
    expect(index.all()).toStrictEqual([{ id: "1", name: "a" }]);
  });
});
