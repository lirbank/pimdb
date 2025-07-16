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

  test("empty query returns all documents", () => {
    expect(index.search("")).toStrictEqual(spaceships);
  });

  test.skip("returned docs are references to the original documents", () => {
    const result = index.search("");
    // Note: toBe() checks for object identity, not value equality which is what
    // we want here
    expect(result[0]).toBe(spaceships[0]);
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

  test.skip("returns true if the document is added", () => {
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
 * update
 */
describe("update", () => {
  let index: PimSubstringIndex<Spaceship>;

  beforeEach(() => {
    index = new PimSubstringIndex<Spaceship>("name");
    spaceships.forEach((doc) => index.insert(doc));
  });

  test("returns false if the document id is not found", () => {
    expect(index.update({ id: "ship000010", name: "New spaceship" })).toBe(
      false,
    );

    // Verify that the document was not added or modified
    expect(index.search("")).toStrictEqual(spaceships);
  });

  test.skip("returns true if the document is updated", () => {
    expect(index.update({ id: "ship000000", name: "New name" })).toBe(true);

    // Verify that the document was updated
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

    // Verify that the document is a reference to the original document
    spaceships.forEach((doc) => {
      expect(doc).toBe(index.search("").find((r) => r.id === doc.id));
    });
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
  });
});
