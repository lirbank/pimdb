import { beforeEach, describe, expect, test } from "vitest";
import { PimSubstringIndex } from "./substring";
import { Spaceship } from "../test-helpers";

const spaceships = [
  { id: "ship000000", name: "BG Prometheus Two-821" },
  { id: "ship000001", name: "ISS Galaxy Mark-II" },
  { id: "ship000002", name: "BG Nova" },
  { id: "ship000003", name: "Auriga Commercial-148" },
  { id: "ship000004", name: "Discovery Elite" },
  { id: "ship000005", name: "USS Prometheus Commercial-396" },
  { id: "ship000006", name: "ISS Discovery X" },
  { id: "ship000007", name: "Galaxy Supreme-897" },
  { id: "ship000008", name: "Sevastopol Alpha" },
  { id: "ship000009", name: "Sevastopol Two" },
] satisfies Spaceship[];

/**
 * search
 */
describe("search", () => {
  let index: PimSubstringIndex<Spaceship>;

  beforeEach(() => {
    index = new PimSubstringIndex<Spaceship>("name");
    spaceships.forEach((doc) => index.insert(doc));
  });

  test("empty query returns all documents in the same order", () => {
    expect(index.search("")).toStrictEqual(spaceships);
  });

  test("returned docs are references, not clones", () => {
    const result = index.search("");
    expect(result.length).toBe(spaceships.length);

    for (let i = 0; i < result.length; i++) {
      // Same reference
      expect(result[i]).toBe(spaceships[i]);
    }

    // Same reference for a non-empty query
    expect(index.search("gal")[0]).toBe(spaceships[1]);
  });

  test("search is case-insensitive (lowercase)", () => {
    expect(index.search("gal")).toStrictEqual([
      { id: "ship000001", name: "ISS Galaxy Mark-II" },
      { id: "ship000007", name: "Galaxy Supreme-897" },
    ]);
  });

  test("search is case-insensitive (uppercase)", () => {
    expect(index.search("GAL")).toStrictEqual([
      { id: "ship000001", name: "ISS Galaxy Mark-II" },
      { id: "ship000007", name: "Galaxy Supreme-897" },
    ]);
  });
});

/**
 * insert
 */
describe("insert", () => {
  let index: PimSubstringIndex<Spaceship>;

  beforeEach(() => {
    index = new PimSubstringIndex<Spaceship>("name");
    spaceships.forEach((doc) => index.insert(doc));
  });

  test("returns false if the document id is already in the index", () => {
    expect(index.insert({ id: "ship000000", name: "New name" })).toBe(false);

    // Verify that the document was not added or modified
    expect(index.search("")).toStrictEqual(spaceships);
  });

  test("returns true if the document is added", () => {
    const d = { id: "ship000010", name: "New name" };
    expect(index.insert(d)).toBe(true);

    // Verify that the document was added
    expect(index.search("")).toStrictEqual([...spaceships, d]);

    // Verify that the document is a reference to the original document
    [...spaceships, d].forEach((doc) => {
      expect(doc).toBe(index.search("").find((r) => r.id === doc.id));
    });
  });
});

/**
 * replace
 */
describe("replace", () => {
  let index: PimSubstringIndex<Spaceship>;

  beforeEach(() => {
    index = new PimSubstringIndex<Spaceship>("name");
    spaceships.forEach((doc) => index.insert(doc));
  });

  test("returns false if the document id is not found", () => {
    expect(
      index.replace(
        { id: "ship000010", name: "Old spaceship" },
        { id: "ship000010", name: "New spaceship" },
      ),
    ).toBe(false);

    // Verify that the document was not added or modified
    expect(index.search("")).toStrictEqual(spaceships);
  });

  test("returns true if the document is replaced", () => {
    const prev = spaceships[0]!;
    const next = { id: "ship000000", name: "New name" };

    expect(index.replace(prev, next)).toBe(true);

    // Verify that the document was replaced
    expect(index.search("")).toStrictEqual([
      { id: "ship000000", name: "New name" },
      { id: "ship000001", name: "ISS Galaxy Mark-II" },
      { id: "ship000002", name: "BG Nova" },
      { id: "ship000003", name: "Auriga Commercial-148" },
      { id: "ship000004", name: "Discovery Elite" },
      { id: "ship000005", name: "USS Prometheus Commercial-396" },
      { id: "ship000006", name: "ISS Discovery X" },
      { id: "ship000007", name: "Galaxy Supreme-897" },
      { id: "ship000008", name: "Sevastopol Alpha" },
      { id: "ship000009", name: "Sevastopol Two" },
    ]);

    // Verify that the replaced document is swapped for the new reference
    expect(index.search("")[0]).toBe(next);

    // Verify that the other documents are still the original references
    spaceships.slice(1).forEach((doc) => {
      expect(doc).toBe(index.search("").find((r) => r.id === doc.id));
    });

    // Verify that the replaced document is not mutated
    expect(prev).toStrictEqual({
      id: "ship000000",
      name: "BG Prometheus Two-821",
    });
  });

  test("replaced document is found by its new value, not its old value", () => {
    expect(index.search("prometheus")).toStrictEqual([
      { id: "ship000000", name: "BG Prometheus Two-821" },
      { id: "ship000005", name: "USS Prometheus Commercial-396" },
    ]);

    index.replace(spaceships[0]!, { id: "ship000000", name: "New name" });

    expect(index.search("prometheus")).toStrictEqual([
      { id: "ship000005", name: "USS Prometheus Commercial-396" },
    ]);
    expect(index.search("new name")).toStrictEqual([
      { id: "ship000000", name: "New name" },
    ]);
  });
});

/**
 * delete
 */
describe("delete", () => {
  let index: PimSubstringIndex<Spaceship>;

  beforeEach(() => {
    index = new PimSubstringIndex<Spaceship>("name");
    spaceships.forEach((doc) => index.insert(doc));
  });

  test("returns false if the document id is not found", () => {
    expect(index.delete({ id: "ship000010", name: "-" })).toBe(false);

    // Verify that the document was not added or modified
    expect(index.search("")).toStrictEqual(spaceships);
  });

  test("returns true if the document is deleted", () => {
    expect(index.delete({ id: "ship000000", name: "-" })).toBe(true);

    // Verify that the document was deleted
    expect(index.search("")).toStrictEqual([
      // { id: "ship000000", name: "BG Prometheus Two-821" },
      { id: "ship000001", name: "ISS Galaxy Mark-II" },
      { id: "ship000002", name: "BG Nova" },
      { id: "ship000003", name: "Auriga Commercial-148" },
      { id: "ship000004", name: "Discovery Elite" },
      { id: "ship000005", name: "USS Prometheus Commercial-396" },
      { id: "ship000006", name: "ISS Discovery X" },
      { id: "ship000007", name: "Galaxy Supreme-897" },
      { id: "ship000008", name: "Sevastopol Alpha" },
      { id: "ship000009", name: "Sevastopol Two" },
    ]);

    // Verify that the document is no longer found by its value
    expect(index.search("prometheus")).toStrictEqual([
      { id: "ship000005", name: "USS Prometheus Commercial-396" },
    ]);
  });
});
