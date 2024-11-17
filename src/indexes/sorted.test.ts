import { expect, test } from "vitest";
import { PimSortedIndex } from "./sorted";

interface TestDoc {
  id: string;
  name: string;
  age?: number;
}

// describe("stable results", () => {
//   let index: PimSortedIndex<TestDoc>;

//   beforeEach(() => {
//     index = new PimSortedIndex<TestDoc>("name");
//     const docs = [
//       { id: "b", name: "aaa" },
//       { id: "c", name: "aaa" },
//       { id: "a", name: "aaa" },
//     ];
//     docs.forEach((doc) => index.insert(doc));
//   });

//   test("returns all documents in stable order when no query", () => {
//     expect(index.find()).toEqual([
//       { id: "a", name: "aaa" },
//       { id: "b", name: "aaa" },
//       { id: "c", name: "aaa" },
//     ]);
//   });

//   test("returns matching documents in stable order when queried", () => {
//     expect(index.find("aaa")).toEqual([
//       { id: "a", name: "aaa" },
//       { id: "b", name: "aaa" },
//       { id: "c", name: "aaa" },
//     ]);
//   });
// });

test("returns results sorted by id regardless of insertion order", () => {
  const index = new PimSortedIndex<TestDoc>("name");

  // Insert documents in arbitrary order
  index.insert({ id: "3", name: "ccc" });
  index.insert({ id: "5", name: "ccccc" });
  index.insert({ id: "7", name: "bbb" });
  index.insert({ id: "6", name: "bbb" });
  index.insert({ id: "0", name: "ccc" });
  index.insert({ id: "4", name: "aaa" });
  index.insert({ id: "1", name: "aaa" });
  index.insert({ id: "2", name: "aaa" });

  // Matching documents secondarily sorted by id
  expect(index.find("aaa")).toEqual([
    { id: "1", name: "aaa" },
    { id: "2", name: "aaa" },
    { id: "4", name: "aaa" },
  ]);

  // Matching documents secondarily sorted by id
  expect(index.find("bbb")).toEqual([
    { id: "6", name: "bbb" },
    { id: "7", name: "bbb" },
  ]);

  // Matching documents secondarily sorted by id
  expect(index.find("ccc")).toEqual([
    { id: "0", name: "ccc" },
    { id: "3", name: "ccc" },
  ]);

  // All documents secondarily sorted by id
  expect(index.find()).toEqual([
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

test("returns results sorted by id regardless of insertion order", () => {
  const index = new PimSortedIndex<TestDoc>("name");

  // Insert documents in arbitrary order
  index.insert({ id: "3", name: "ccc" });
  index.insert({ id: "5", name: "ccccc" });
  index.insert({ id: "7", name: "bbb" });
  index.insert({ id: "6", name: "bbb" });
  index.insert({ id: "0", name: "ccc" });
  index.insert({ id: "4", name: "aaa" });
  index.insert({ id: "1", name: "aaa" });
  index.insert({ id: "2", name: "aaa" });

  // Matching documents secondarily sorted by id
  expect(index.findInRange("aaa", "aaa")).toEqual([
    { id: "1", name: "aaa" },
    { id: "2", name: "aaa" },
    { id: "4", name: "aaa" },
  ]);

  // Matching documents secondarily sorted by id
  expect(index.findInRange("bbb", "bbb")).toEqual([
    { id: "6", name: "bbb" },
    { id: "7", name: "bbb" },
  ]);

  // Matching documents secondarily sorted by id
  expect(index.findInRange("ccc", "ccc")).toEqual([
    { id: "0", name: "ccc" },
    { id: "3", name: "ccc" },
  ]);

  // All documents secondarily sorted by id
  expect(index.find()).toEqual([
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
  expect(index.find()).toEqual([
    { id: "d", name: "" },
    { id: "h", name: "" },
    { id: "f", name: "AAA" },
    { id: "b", name: "YYY" },
    { id: "e", name: "aaa" },
    { id: "g", name: "aaa" },
    { id: "a", name: "xxx" },
    { id: "c", name: "yyy" },
  ]);

  // Query for empty string returns documents with empty name
  expect(index.find("")).toEqual([
    { id: "d", name: "" },
    { id: "h", name: "" },
  ]);

  // Query for "aaa" returns documents with "aaa" name
  expect(index.find("aaa")).toEqual([
    { id: "e", name: "aaa" },
    { id: "g", name: "aaa" },
  ]);

  // Query for unknown value returns empty array
  expect(index.find("unknown")).toEqual([]);
});
