import { describe, expect, test } from "vitest";
import { createPimDB, PimCollection } from "./pimdb";
import { PimSubstringIndex } from "./indexes/substring";
import { PimSortedIndex } from "./indexes/sorted";
import { PimPrimaryIndex } from "./indexes/primary";
import { Spaceship } from "./test-helpers";

function testFactory() {
  const insertedSpaceships = [
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

  insertedSpaceships.forEach((doc) => db.spaceships.insert(doc));

  return { db, insertedSpaceships };
}

/**
 * insert
 */
describe("insert", () => {
  test("returns false on duplicate document id", () => {
    const { db } = testFactory();

    expect(db.spaceships.insert({ id: "ship000000", name: "New name" })).toBe(
      false,
    );
  });

  test("returns true on successful insertion", () => {
    const { db } = testFactory();

    expect(db.spaceships.insert({ id: "ship000010", name: "New name" })).toBe(
      true,
    );
  });

  test("inserted documents are immutable", () => {
    const { db } = testFactory();

    const spaceship = { id: "ship000010", name: "Sulaco" };
    db.spaceships.insert(spaceship);

    // Mutate the original object
    spaceship.name = "Nostromo";

    // Get the object from the primary index
    const result = db.spaceships.getIndex("primary").get(spaceship.id);

    // Verify that the object in the store is not mutated (not Nostromo)
    expect(result).toStrictEqual({ id: "ship000010", name: "Sulaco" });

    // Verify that the object in the store is not mutated (not a reference to
    // the original object)
    expect(result).not.toBe(spaceship);
  });
});

/**
 * update
 */
describe("update", () => {
  const { db, insertedSpaceships } = testFactory();

  test("returns false if the document id does not exist", () => {
    expect(db.spaceships.update({ id: "ship000010", name: "New name" })).toBe(
      false,
    );
  });

  test("returns true if the document is updated", () => {
    expect(db.spaceships.update({ id: "ship000000", name: "New name" })).toBe(
      true,
    );

    // Verify that the document is updated
    expect(db.spaceships.getIndex("primary").get("ship000000")).toStrictEqual({
      id: "ship000000",
      name: "New name",
    });

    // Verify that the document is a reference to the original document
    insertedSpaceships.forEach((doc) => {
      expect(doc).not.toBe(db.spaceships.getIndex("primary").get(doc.id));
    });
  });

  test("updated documents are immutable", () => {
    const { db } = testFactory();

    const spaceship = { id: "ship000000", name: "Sulaco" };

    db.spaceships.update(spaceship);

    // Mutate the original object
    spaceship.name = "Nostromo";

    // Get the object from the primary index
    const result = db.spaceships.getIndex("primary").get(spaceship.id);

    // Verify that the object in the store is not mutated (not Nostromo)
    expect(result).toStrictEqual({ id: "ship000000", name: "Sulaco" });

    // Verify that the object in the store is not mutated (not a reference to
    // the original object)
    expect(result).not.toBe(spaceship);
  });
});

/**
 * delete
 */
describe("delete", () => {
  const { db, insertedSpaceships } = testFactory();

  test("returns false if the document id is not in the index", () => {
    expect(db.spaceships.delete("ship000010")).toBe(false);
  });

  test("returns true if the document is deleted", () => {
    expect(db.spaceships.delete(insertedSpaceships[0]!.id)).toBe(true);

    // Verify that the document is deleted
    expect(
      db.spaceships.getIndex("primary").get(insertedSpaceships[0]!.id),
    ).toBe(undefined);
  });
});

/**
 * substring.search
 */
describe("substring.search", () => {
  test("inserts clones, not references", () => {
    const { db, insertedSpaceships } = testFactory();
    const result = db.spaceships.getIndex("substring").search("");

    expect(result.length).toBe(insertedSpaceships.length);
    expect(result).toStrictEqual(insertedSpaceships);

    for (let i = 0; i < insertedSpaceships.length; i++) {
      const insertedSpaceship = insertedSpaceships[i];
      const resultSpaceship = result[i];

      expect(insertedSpaceship).toBeDefined();
      expect(resultSpaceship).toBeDefined();

      // Same content
      expect(insertedSpaceship).toStrictEqual(resultSpaceship);

      // Different reference
      expect(insertedSpaceship).not.toBe(resultSpaceship);
    }
  });

  test("returns clones, not references", () => {
    const { db } = testFactory();
    const resultA = db.spaceships.getIndex("substring").search("");
    const resultB = db.spaceships.getIndex("substring").search("");

    expect(resultA.length).toBe(resultB.length);
    expect(resultA).toStrictEqual(resultB);

    for (let i = 0; i < resultA.length; i++) {
      const docA = resultA[i];
      const docB = resultB[i];

      expect(docA).toBeDefined();
      expect(docB).toBeDefined();

      // Same content
      expect(docA).toStrictEqual(docB);

      // Different reference
      expect(docA).not.toBe(docB);
    }
  });

  test("empty query returns all documents in the order they were inserted", () => {
    const { db, insertedSpaceships } = testFactory();

    expect(db.spaceships.getIndex("substring").search("")).toStrictEqual(
      insertedSpaceships,
    );
  });
});

/**
 * sorted.find
 */
describe("sorted.find", () => {
  test("returns clones, not references", () => {
    const { db, insertedSpaceships } = testFactory();
    const result = db.spaceships.getIndex("sorted").find();

    insertedSpaceships.forEach((doc) => {
      expect(doc).not.toBe(result.find((r) => r.id === doc.id));
    });
  });

  test("empty query returns all documents (ordered by name)", () => {
    const { db } = testFactory();

    expect(db.spaceships.getIndex("sorted").find()).toStrictEqual([
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
 * sorted.findInRange
 */
describe("sorted.findInRange", () => {
  test("returns clones, not references", () => {
    const { db, insertedSpaceships } = testFactory();
    const result = db.spaceships.getIndex("sorted").findInRange({});

    insertedSpaceships.forEach((doc) => {
      expect(doc).not.toBe(result.find((r) => r.id === doc.id));
    });
  });

  test("empty query returns all documents (ordered by name)", () => {
    const { db } = testFactory();

    expect(db.spaceships.getIndex("sorted").findInRange({})).toStrictEqual([
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
 * primary.get
 */
describe("primary.get", () => {
  test("inserts clones, not references", () => {
    const { db, insertedSpaceships } = testFactory();
    const insertedSpaceship = insertedSpaceships[0]!;
    expect(insertedSpaceship).toBeDefined();

    const result = db.spaceships.getIndex("primary").get(insertedSpaceship.id);
    expect(result).toBeDefined();

    expect(insertedSpaceship).not.toBe(result);
  });

  test("inserts clones, not references 2", () => {
    const { db, insertedSpaceships } = testFactory();
    const insertedSpaceship = insertedSpaceships[0]!;
    expect(insertedSpaceship).toBeDefined();

    const result = db.spaceships.getIndex("primary").get(insertedSpaceship.id);
    expect(result).toBeDefined();

    expect(insertedSpaceship).not.toBe(result);

    // Mutate the original object
    insertedSpaceship.name = "New name";
    expect(insertedSpaceship).not.toBe(result);
    expect(result).toStrictEqual({
      id: "ship000000",
      name: "BG Prometheus Two-821",
    });
  });

  test("returns clones, not references", () => {
    const { db, insertedSpaceships } = testFactory();
    const insertedSpaceship = insertedSpaceships[0]!;

    const resultA = db.spaceships.getIndex("primary").get(insertedSpaceship.id);
    const resultB = db.spaceships.getIndex("primary").get(insertedSpaceship.id);
    expect(resultA).not.toBe(resultB);
  });
});

/**
 * primary.all
 */
describe("primary.all", () => {
  test("inserts clones, not references", () => {
    const { db, insertedSpaceships } = testFactory();
    const result = db.spaceships.getIndex("primary").all();

    insertedSpaceships.forEach((insertedSpaceship) => {
      const found = result.find((r) => r.id === insertedSpaceship.id);

      // Ensure the object is present in the result - this is important because
      // the next assertion will always pass if found is undefined.
      expect(found).toBeDefined();

      // Ensure it's not the same reference
      expect(insertedSpaceship).not.toBe(found);
    });
  });

  test("returns clones, not references", () => {
    const { db } = testFactory();
    const resultA = db.spaceships.getIndex("primary").all();
    const resultB = db.spaceships.getIndex("primary").all();

    resultA.forEach((docA) => {
      const docB = resultB.find((r) => r.id === docA.id);

      // Ensure the object is present in the second result
      expect(docB).toBeDefined();

      // Different reference
      expect(docA).not.toBe(docB);

      // Same content
      expect(docA).toStrictEqual(docB);
    });
  });

  test("returns all documents in the order they were inserted", () => {
    const { db, insertedSpaceships } = testFactory();

    expect(db.spaceships.getIndex("primary").all()).toStrictEqual(
      insertedSpaceships,
    );
  });
});
