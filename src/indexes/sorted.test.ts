import { beforeEach, describe, expect, test } from "vitest";
import { PimSortedIndex } from "./sorted";

interface TestDoc {
  id: string;
  name: string;
  age?: number;
}

test("find with upper and lower case", () => {
  const index = new PimSortedIndex<TestDoc>("name");

  index.insert({ id: "e", name: "aaa" });
  index.insert({ id: "a", name: "xxx" });
  index.insert({ id: "h", name: "" });
  index.insert({ id: "b", name: "YYY" });
  index.insert({ id: "d", name: "" });
  index.insert({ id: "c", name: "yyy" });
  index.insert({ id: "f", name: "AAA" });
  index.insert({ id: "g", name: "aaa" });

  // Empty query returns all documents
  expect(index.find()).toStrictEqual([
    { id: "d", name: "" },
    { id: "h", name: "" },
    { id: "f", name: "AAA" },
    { id: "b", name: "YYY" },
    { id: "e", name: "aaa" },
    { id: "g", name: "aaa" },
    { id: "a", name: "xxx" },
    { id: "c", name: "yyy" },
  ]);

  // Query for unknown value returns empty array
  expect(index.find("unknown")).toStrictEqual([]);
});

/**
 * find
 */
describe("find", () => {
  let index: PimSortedIndex<TestDoc>;

  beforeEach(() => {
    // Reset index before each test
    index = new PimSortedIndex<TestDoc>("name");
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
  let index: PimSortedIndex<TestDoc>;

  beforeEach(() => {
    // Reset index before each test
    index = new PimSortedIndex<TestDoc>("name");
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
 * update
 */
describe("update", () => {
  let index: PimSortedIndex<TestDoc>;

  beforeEach(() => {
    // Reset index before each test
    index = new PimSortedIndex<TestDoc>("name");
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

  test("updating a document with unknown id has no effect", () => {
    index.update({ id: "not-an-id", name: "new value" });

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

  test("updating a document by id updates the document and maintains sorted order", () => {
    index.update({ id: "2", name: "bbbb new value" });

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
});

/**
 * delete
 */
describe("delete", () => {
  let index: PimSortedIndex<TestDoc>;

  beforeEach(() => {
    // Reset index before each test
    index = new PimSortedIndex<TestDoc>("name");
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