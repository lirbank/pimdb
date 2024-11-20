import { describe, expect, test } from "vitest";
import { createPimDB, PimCollection } from "./pimdb";
import { PimSubstringIndex } from "./indexes/substring";
import { PimSortedIndex } from "./indexes/sorted";
import { PimPrimaryIndex } from "./indexes/primary";

interface Spaceship {
  id: string;
  name: string;
}

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

function testFactory() {
  const spaceshipsIndices = {
    primary: new PimPrimaryIndex<Spaceship>(),
    sorted: new PimSortedIndex<Spaceship>("name"),
    substring: new PimSubstringIndex<Spaceship>("name"),
  };

  const db = createPimDB({
    spaceships: new PimCollection<Spaceship, typeof spaceshipsIndices>(
      spaceshipsIndices,
    ),
  });

  spaceships.forEach((doc) => db.spaceships.insert(doc));

  return db;
}

/**
 * insert
 */
describe("insert", () => {
  const db = testFactory();

  test("returns false if the document id is already in the index", () => {
    // TODO: Fix !
    expect(db.spaceships.insert(spaceships[0]!)).toBe(undefined);
  });
});

/**
 * search
 */
describe("search", () => {
  const db = testFactory();

  test("empty query returns all documents (as inserted)", () => {
    expect(db.spaceships.indexes.substring.search("")).toStrictEqual(
      spaceships,
    );
  });

  test("empty query returns all documents (as inserted)", () => {
    expect(db.spaceships.indexes.primary.all()).toStrictEqual(spaceships);
  });

  test("empty query returns all documents (ordered by name)", () => {
    expect(db.spaceships.indexes.sorted.find()).toStrictEqual([
      { id: "ship000003", name: "Auriga Commercial-148" },
      { id: "ship000002", name: "BG Nova" },
      { id: "ship000000", name: "BG Prometheus Two-821" },
      { id: "ship000004", name: "Discovery Elite" },
      { id: "ship000007", name: "Galaxy Supreme-897" },
      { id: "ship000006", name: "ISS Discovery X" },
      { id: "ship000001", name: "ISS Galaxy Mark-II" },
      { id: "ship000008", name: "Sevastopol Alpha" },
      { id: "ship000009", name: "Sevastopol Two" },
      { id: "ship000005", name: "USS Prometheus Commercial-396" },
    ]);
  });

  test("empty query returns all documents (ordered by name)", () => {
    expect(db.spaceships.indexes.sorted.findInRange({})).toStrictEqual([
      { id: "ship000003", name: "Auriga Commercial-148" },
      { id: "ship000002", name: "BG Nova" },
      { id: "ship000000", name: "BG Prometheus Two-821" },
      { id: "ship000004", name: "Discovery Elite" },
      { id: "ship000007", name: "Galaxy Supreme-897" },
      { id: "ship000006", name: "ISS Discovery X" },
      { id: "ship000001", name: "ISS Galaxy Mark-II" },
      { id: "ship000008", name: "Sevastopol Alpha" },
      { id: "ship000009", name: "Sevastopol Two" },
      { id: "ship000005", name: "USS Prometheus Commercial-396" },
    ]);
  });
});

/**
 * references
 */
describe("references", () => {
  const db = testFactory();

  test("substring.search: indexes return references to the original documents", () => {
    const result = db.spaceships.indexes.substring.search("");

    spaceships.forEach((doc) => {
      expect(doc).toBe(result.find((r) => r.id === doc.id));
    });
  });

  test("primary.all: indexes return references to the original documents", () => {
    const result = db.spaceships.indexes.primary.all();

    spaceships.forEach((doc) => {
      expect(doc).toBe(result.find((r) => r.id === doc.id));
    });
  });

  test("sorted.find: indexes return references to the original documents", () => {
    const result = db.spaceships.indexes.sorted.find();

    spaceships.forEach((doc) => {
      expect(doc).toBe(result.find((r) => r.id === doc.id));
    });
  });
});
