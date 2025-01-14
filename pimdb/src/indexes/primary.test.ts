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

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    expect(index.get("1")).toBe(a);
    expect(index.get("2")).toBe(b);
    expect(index.get("3")).toBe(c);
  });

  test("all", () => {
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

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    expect(index.all()[0]).toBe(a);
    expect(index.all()[1]).toBe(b);
    expect(index.all()[2]).toBe(c);

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    expect(index.all()[0]).toBe(index.get("1"));
    expect(index.all()[1]).toBe(index.get("2"));
    expect(index.all()[2]).toBe(index.get("3"));
  });

  test("insert", () => {
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

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    expect(index.get("1")).toBe(a);
    expect(index.get("2")).toBe(b);
    expect(index.get("3")).toBe(c);

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    const arr = index.all();
    expect(arr[0]).toBe(a);
    expect(arr[1]).toBe(b);
    expect(arr[2]).toBe(c);
  });

  test("update", () => {
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

    index.update({ id: "1", name: "x" });
    expect(index.all()).toStrictEqual([
      { id: "1", name: "x" },
      { id: "2", name: "b" },
      { id: "3", name: "c" },
    ]);

    index.update({ id: "2", name: "y" });
    expect(index.all()).toStrictEqual([
      { id: "1", name: "x" },
      { id: "2", name: "y" },
      { id: "3", name: "c" },
    ]);

    index.update({ id: "3", name: "z" });
    expect(index.all()).toStrictEqual([
      { id: "1", name: "x" },
      { id: "2", name: "y" },
      { id: "3", name: "z" },
    ]);

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    expect(index.get("1")).toBe(a);
    expect(index.get("2")).toBe(b);
    expect(index.get("3")).toBe(c);

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    const arr = index.all();
    expect(arr[0]).toBe(a);
    expect(arr[1]).toBe(b);
    expect(arr[2]).toBe(c);
  });
});
