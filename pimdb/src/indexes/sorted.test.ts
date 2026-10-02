import { beforeEach, describe, expect, test } from "vitest";
import { PimSortedIndex } from "./sorted";
import { Spaceship } from "../test-helpers";

/**
 * find
 */
describe("find", () => {
  let index: PimSortedIndex<Spaceship>;

  const docs = [
    { id: "3", name: "ccc" },
    { id: "5", name: "ccccc" },
    { id: "7", name: "bbb" },
    { id: "6", name: "bbb" },
    { id: "0", name: "ccc" },
    { id: "9", name: "" },
    { id: "11", name: "BBB" },
    { id: "10", name: "AAA" },
    { id: "8", name: "" },
    { id: "4", name: "aaa" },
    { id: "1", name: "aaa" },
    { id: "2", name: "aaa" },
  ];

  beforeEach(() => {
    // Reset index before each test
    index = new PimSortedIndex<Spaceship>("name");
    // Insert documents in random order to verify sorting
    docs.forEach((doc) => index.insert(doc));
  });

  test("undefined query returns all documents, secondarily sorted by id", () => {
    // All documents secondarily sorted by id
    expect(index.find()).toStrictEqual([
      { id: "8", name: "" },
      { id: "9", name: "" },
      { id: "10", name: "AAA" },
      { id: "11", name: "BBB" },
      { id: "1", name: "aaa" },
      { id: "2", name: "aaa" },
      { id: "4", name: "aaa" },
      { id: "6", name: "bbb" },
      { id: "7", name: "bbb" },
      { id: "0", name: "ccc" },
      { id: "3", name: "ccc" },
      { id: "5", name: "ccccc" },
    ]);
  });

  test("returns 'AAA' documents sorted by id", () => {
    expect(index.find("AAA")).toStrictEqual([{ id: "10", name: "AAA" }]);
  });

  test("returns 'BBB' documents sorted by id", () => {
    expect(index.find("BBB")).toStrictEqual([{ id: "11", name: "BBB" }]);
  });

  test("returns 'aaa' documents sorted by id", () => {
    expect(index.find("aaa")).toStrictEqual([
      { id: "1", name: "aaa" },
      { id: "2", name: "aaa" },
      { id: "4", name: "aaa" },
    ]);
  });

  test("returns 'bbb' documents sorted by id", () => {
    expect(index.find("bbb")).toStrictEqual([
      { id: "6", name: "bbb" },
      { id: "7", name: "bbb" },
    ]);
  });

  test("returns 'ccc' documents sorted by id", () => {
    expect(index.find("ccc")).toStrictEqual([
      { id: "0", name: "ccc" },
      { id: "3", name: "ccc" },
    ]);
  });

  test("returns '' documents sorted by id", () => {
    expect(index.find("")).toStrictEqual([
      { id: "8", name: "" },
      { id: "9", name: "" },
    ]);
  });

  test("returns empty array when no match", () => {
    expect(index.find("unknown")).toStrictEqual([]);
  });
});

/**
 * findInRange
 */
describe("findInRange", () => {
  let index: PimSortedIndex<Spaceship>;

  beforeEach(() => {
    // Reset index before each test
    index = new PimSortedIndex<Spaceship>("name");
    // Insert documents in random order to verify sorting
    [
      { id: "3", name: "ccc" },
      { id: "5", name: "ccccc" },
      { id: "7", name: "bbb" },
      { id: "6", name: "bbb" },
      { id: "0", name: "ccc" },
      { id: "9", name: "" },
      { id: "11", name: "BBB" },
      { id: "10", name: "AAA" },
      { id: "8", name: "" },
      { id: "4", name: "aaa" },
      { id: "1", name: "aaa" },
      { id: "2", name: "aaa" },
    ].forEach((doc) => index.insert(doc));
  });

  test("undefined bounds returns all documents, secondarily sorted by id", () => {
    const expected = [
      { id: "8", name: "" },
      { id: "9", name: "" },
      { id: "10", name: "AAA" },
      { id: "11", name: "BBB" },
      { id: "1", name: "aaa" },
      { id: "2", name: "aaa" },
      { id: "4", name: "aaa" },
      { id: "6", name: "bbb" },
      { id: "7", name: "bbb" },
      { id: "0", name: "ccc" },
      { id: "3", name: "ccc" },
      { id: "5", name: "ccccc" },
    ];

    // Empty object or undefined returns all documents
    expect(index.findInRange({})).toStrictEqual(expected);
    expect(index.findInRange()).toStrictEqual(expected);
  });

  test("returns 'aaa' documents sorted by id", () => {
    expect(index.findInRange({ gte: "aaa", lte: "aaa" })).toStrictEqual([
      { id: "1", name: "aaa" },
      { id: "2", name: "aaa" },
      { id: "4", name: "aaa" },
    ]);
  });

  test("returns 'bbb' documents sorted by id", () => {
    expect(index.findInRange({ gte: "bbb", lte: "bbb" })).toStrictEqual([
      { id: "6", name: "bbb" },
      { id: "7", name: "bbb" },
    ]);
  });

  test("returns 'ccc' documents sorted by id", () => {
    expect(index.findInRange({ gte: "ccc", lte: "ccc" })).toStrictEqual([
      { id: "0", name: "ccc" },
      { id: "3", name: "ccc" },
    ]);
  });

  test("returns empty array when range is after all values", () => {
    expect(index.findInRange({ gte: "zzz", lte: "zzzz" })).toStrictEqual([]);
  });

  test("returns empty array when range is before all values", () => {
    expect(index.findInRange({ gte: "000", lte: "999" })).toStrictEqual([]);
  });

  test("handles non-existent boundary values", () => {
    // Should include everything >= "bb" and <= "cc"
    expect(index.findInRange({ gte: "bb", lte: "cc" })).toStrictEqual([
      { id: "6", name: "bbb" },
      { id: "7", name: "bbb" },
    ]);
  });

  test("handles exact boundary values", () => {
    // Should include everything >= "bbb" and <= "ccc"
    expect(index.findInRange({ gte: "bbb", lte: "ccc" })).toStrictEqual([
      { id: "6", name: "bbb" },
      { id: "7", name: "bbb" },
      { id: "0", name: "ccc" },
      { id: "3", name: "ccc" },
    ]);
  });

  test("handles undefined lower bound", () => {
    // Should include everything <= "bbb"
    expect(index.findInRange({ lte: "bbb" })).toStrictEqual([
      { id: "8", name: "" },
      { id: "9", name: "" },
      { id: "10", name: "AAA" },
      { id: "11", name: "BBB" },
      { id: "1", name: "aaa" },
      { id: "2", name: "aaa" },
      { id: "4", name: "aaa" },
      { id: "6", name: "bbb" },
      { id: "7", name: "bbb" },
    ]);
  });

  test("handles undefined upper bound", () => {
    // Should include everything >= "ccc"
    expect(index.findInRange({ gte: "ccc" })).toStrictEqual([
      { id: "0", name: "ccc" },
      { id: "3", name: "ccc" },
      { id: "5", name: "ccccc" },
    ]);
  });
});

/**
 * insert
 */
describe("insert", () => {
  let index: PimSortedIndex<Spaceship>;

  const docs = [
    { id: "3", name: "ccc" },
    { id: "5", name: "ccccc" },
    { id: "7", name: "bbb" },
    { id: "6", name: "bbb" },
    { id: "0", name: "ccc" },
    { id: "9", name: "" },
    { id: "11", name: "BBB" },
    { id: "10", name: "AAA" },
    { id: "8", name: "" },
    { id: "4", name: "aaa" },
    { id: "1", name: "aaa" },
    { id: "2", name: "aaa" },
  ];

  beforeEach(() => {
    // Reset index before each test
    index = new PimSortedIndex<Spaceship>("name");
    // Insert documents in random order to verify sorting
    docs.forEach((doc) => index.insert(doc));
  });

  test("inserted documents are in sorted order", () => {
    const result = index.find();
    expect(result).toStrictEqual([
      { id: "8", name: "" },
      { id: "9", name: "" },
      { id: "10", name: "AAA" },
      { id: "11", name: "BBB" },
      { id: "1", name: "aaa" },
      { id: "2", name: "aaa" },
      { id: "4", name: "aaa" },
      { id: "6", name: "bbb" },
      { id: "7", name: "bbb" },
      { id: "0", name: "ccc" },
      { id: "3", name: "ccc" },
      { id: "5", name: "ccccc" },
    ]);
  });

  test("inserted document references the same object as the indexed documents", () => {
    const result = index.find();

    // The index should return the same object reference as the one inserted.
    // This is the intended behavior.
    docs.forEach((doc) => {
      expect(doc).toBe(result.find((r) => r.id === doc.id));
    });
  });
});

/**
 * replace
 */
describe("replace", () => {
  let index: PimSortedIndex<Spaceship>;

  const docs = [
    { id: "3", name: "ccc" },
    { id: "5", name: "ccccc" },
    { id: "7", name: "bbb" },
    { id: "6", name: "bbb" },
    { id: "0", name: "ccc" },
    { id: "9", name: "" },
    { id: "11", name: "BBB" },
    { id: "10", name: "AAA" },
    { id: "8", name: "" },
    { id: "4", name: "aaa" },
    { id: "1", name: "aaa" },
    { id: "2", name: "aaa" },
  ];

  beforeEach(() => {
    // Reset index before each test
    index = new PimSortedIndex<Spaceship>("name");
    // Insert documents in random order to verify sorting
    docs.forEach((doc) => index.insert(doc));
  });

  const getDoc = (id: string) => docs.find((doc) => doc.id === id)!;

  test("replacing a document with unknown id has no effect", () => {
    expect(
      index.replace(
        { id: "not-an-id", name: "old value" },
        { id: "not-an-id", name: "new value" },
      ),
    ).toBe(false);

    expect(index.find()).toStrictEqual([
      { id: "8", name: "" },
      { id: "9", name: "" },
      { id: "10", name: "AAA" },
      { id: "11", name: "BBB" },
      { id: "1", name: "aaa" },
      { id: "2", name: "aaa" },
      { id: "4", name: "aaa" },
      { id: "6", name: "bbb" },
      { id: "7", name: "bbb" },
      { id: "0", name: "ccc" },
      { id: "3", name: "ccc" },
      { id: "5", name: "ccccc" },
    ]);
  });

  test("replacing a document by id replaces the document and maintains sorted order", () => {
    expect(
      index.replace(getDoc("2"), { id: "2", name: "bbbb new value" }),
    ).toBe(true);

    expect(index.find()).toStrictEqual([
      { id: "8", name: "" },
      { id: "9", name: "" },
      { id: "10", name: "AAA" },
      { id: "11", name: "BBB" },
      { id: "1", name: "aaa" },
      { id: "4", name: "aaa" },
      { id: "6", name: "bbb" },
      { id: "7", name: "bbb" },
      { id: "2", name: "bbbb new value" }, // Here
      { id: "0", name: "ccc" },
      { id: "3", name: "ccc" },
      { id: "5", name: "ccccc" },
    ]);
  });

  test("replaced document is found by its new value, not its old value", () => {
    index.replace(getDoc("2"), { id: "2", name: "bbbb new value" });

    expect(index.find("bbbb new value")).toStrictEqual([
      { id: "2", name: "bbbb new value" },
    ]);
    expect(index.find("aaa")).toStrictEqual([
      { id: "1", name: "aaa" },
      { id: "4", name: "aaa" },
    ]);
  });

  test("replacing a document without changing the indexed value keeps its position", () => {
    const next = { id: "2", name: "aaa" };
    expect(index.replace(getDoc("2"), next)).toBe(true);

    const result = index.find("aaa");
    expect(result).toStrictEqual([
      { id: "1", name: "aaa" },
      { id: "2", name: "aaa" },
      { id: "4", name: "aaa" },
    ]);

    // The stored reference is replaced by the new document
    expect(result[1]).toBe(next);
  });

  test("replaced document is swapped for the new reference", () => {
    const prev = getDoc("2");
    const next = { id: "2", name: "bbbb new value" };

    // Replace a document
    index.replace(prev, next);

    const result = index.find();

    // The replaced document is swapped for the new reference
    expect(result.find((r) => r.id === "2")).toBe(next);

    // The other documents are still the same object references as the ones
    // inserted
    docs
      .filter((doc) => doc.id !== "2")
      .forEach((doc) => {
        expect(doc).toBe(result.find((r) => r.id === doc.id));
      });

    // The replaced document is not mutated
    expect(prev).toStrictEqual({ id: "2", name: "aaa" });
  });
});

/**
 * delete
 */
describe("delete", () => {
  let index: PimSortedIndex<Spaceship>;

  beforeEach(() => {
    // Reset index before each test
    index = new PimSortedIndex<Spaceship>("name");
    // Insert documents in random order to verify sorting
    [
      { id: "3", name: "ccc" },
      { id: "5", name: "ccccc" },
      { id: "7", name: "bbb" },
      { id: "6", name: "bbb" },
      { id: "0", name: "ccc" },
      { id: "9", name: "" },
      { id: "11", name: "BBB" },
      { id: "10", name: "AAA" },
      { id: "8", name: "" },
      { id: "4", name: "aaa" },
      { id: "1", name: "aaa" },
      { id: "2", name: "aaa" },
    ].forEach((doc) => index.insert(doc));
  });

  test("deleting a document with unknown id has no effect", () => {
    index.delete({ id: "not-an-id", name: "not-an-name" });

    expect(index.find()).toStrictEqual([
      { id: "8", name: "" },
      { id: "9", name: "" },
      { id: "10", name: "AAA" },
      { id: "11", name: "BBB" },
      { id: "1", name: "aaa" },
      { id: "2", name: "aaa" },
      { id: "4", name: "aaa" },
      { id: "6", name: "bbb" },
      { id: "7", name: "bbb" },
      { id: "0", name: "ccc" },
      { id: "3", name: "ccc" },
      { id: "5", name: "ccccc" },
    ]);
  });

  test("deleting a document by id removes the document and maintains sorted order", () => {
    index.delete({ id: "2", name: "___todo___" });

    expect(index.find()).toStrictEqual([
      { id: "8", name: "" },
      { id: "9", name: "" },
      { id: "10", name: "AAA" },
      { id: "11", name: "BBB" },
      { id: "1", name: "aaa" },
      // { id: "2", name: "aaa" }, // Removed
      { id: "4", name: "aaa" },
      { id: "6", name: "bbb" },
      { id: "7", name: "bbb" },
      { id: "0", name: "ccc" },
      { id: "3", name: "ccc" },
      { id: "5", name: "ccccc" },
    ]);
  });
});
