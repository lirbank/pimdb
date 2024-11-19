import { bench, describe } from "vitest";
import { PimSortedIndex } from "./sorted";
import testData1000 from "./benchmarks/benchmark-data-1000.json";
import testData10000 from "./benchmarks/benchmark-data-10000.json";
import testData100000_ from "./benchmarks/benchmark-data-100000.json";

interface Spaceship {
  id: string;
  name: string;
}

// VSCode doesn't import the types from the larger JSON file, so we need to cast it
const testData100000 = testData100000_ as Spaceship[];

function getMiddleDoc(arr: Spaceship[]) {
  return arr[Math.floor(arr.length / 2)]!;
}

/**
 * find
 */
describe("find", () => {
  const index1000 = new PimSortedIndex<Spaceship>("name");
  testData1000.forEach((doc) => index1000.insert(doc));

  const index10000 = new PimSortedIndex<Spaceship>("name");
  testData10000.forEach((doc) => index10000.insert(doc));

  const index100000 = new PimSortedIndex<Spaceship>("name");
  testData100000.forEach((doc) => index100000.insert(doc));

  // Nostromo
  bench("100000 docs - Nostromo", () => {
    index100000.find("Nostromo");
  });

  bench("10000 docs - Nostromo", () => {
    index10000.find("Nostromo");
  });

  bench("1000 docs - Nostromo", () => {
    index1000.find("Nostromo");
  });

  // Nothing (does not exist)
  bench("100000 docs - Nothing", () => {
    index100000.find("Nothing");
  });

  bench("10000 docs - Nothing", () => {
    index10000.find("Nothing");
  });

  bench("1000 docs - Nothing", () => {
    index1000.find("Nothing");
  });
});

/**
 * findInRange
 */
describe("findInRange", () => {
  const index1000 = new PimSortedIndex<Spaceship>("name");
  testData1000.forEach((doc) => index1000.insert(doc));

  const index10000 = new PimSortedIndex<Spaceship>("name");
  testData10000.forEach((doc) => index10000.insert(doc));

  const index100000 = new PimSortedIndex<Spaceship>("name");
  testData100000.forEach((doc) => index100000.insert(doc));

  // Nostromo
  bench("100000 docs - Nostromo", () => {
    index100000.findInRange({ gte: "Nostromo", lte: "Nostromo" });
  });

  bench("10000 docs - Nostromo", () => {
    index10000.findInRange({ gte: "Nostromo", lte: "Nostromo" });
  });

  bench("1000 docs - Nostromo", () => {
    index1000.findInRange({ gte: "Nostromo", lte: "Nostromo" });
  });

  // Nothing (does not exist)
  bench("100000 docs - Nothing", () => {
    index100000.findInRange({ gte: "Nothing", lte: "Nothing" });
  });

  bench("10000 docs - Nothing", () => {
    index10000.findInRange({ gte: "Nothing", lte: "Nothing" });
  });

  bench("1000 docs - Nothing", () => {
    index1000.findInRange({ gte: "Nothing", lte: "Nothing" });
  });
});

/**
 * insert
 */
describe("insert", () => {
  const index1000 = new PimSortedIndex<Spaceship>("name");
  testData1000.forEach((doc) => index1000.insert(doc));

  const index10000 = new PimSortedIndex<Spaceship>("name");
  testData10000.forEach((doc) => index10000.insert(doc));

  const index100000 = new PimSortedIndex<Spaceship>("name");
  testData100000.forEach((doc) => index100000.insert(doc));

  // Nostromo
  bench("100000 docs - Nostromo", () => {
    index100000.insert({ id: "1000", name: "Nostromo" });
  });

  bench("10000 docs - Nostromo", () => {
    index10000.insert({ id: "1000", name: "Nostromo" });
  });

  bench("1000 docs - Nostromo", () => {
    index1000.insert({ id: "1000", name: "Nostromo" });
  });
});

/**
 * update
 */
describe("update", () => {
  const index1000 = new PimSortedIndex<Spaceship>("name");
  testData1000.forEach((doc) => index1000.insert(doc));

  const index10000 = new PimSortedIndex<Spaceship>("name");
  testData10000.forEach((doc) => index10000.insert(doc));

  const index100000 = new PimSortedIndex<Spaceship>("name");
  testData100000.forEach((doc) => index100000.insert(doc));

  // Nostromo
  bench("100000 docs - Nostromo", () => {
    index100000.update({ id: "1000", name: "Nostromo" });
  });

  bench("10000 docs - Nostromo", () => {
    index10000.update({ id: "1000", name: "Nostromo" });
  });

  bench("1000 docs - Nostromo", () => {
    index1000.update({ id: "1000", name: "Nostromo" });
  });
});

/**
 * delete
 */
describe("delete", () => {
  const index1000 = new PimSortedIndex<Spaceship>("name");
  testData1000.forEach((doc) => index1000.insert(doc));

  const index10000 = new PimSortedIndex<Spaceship>("name");
  testData10000.forEach((doc) => index10000.insert(doc));

  const index100000 = new PimSortedIndex<Spaceship>("name");
  testData100000.forEach((doc) => index100000.insert(doc));

  // Middle doc
  {
    const doc = getMiddleDoc(testData100000);
    bench(
      `100000 docs - ${doc.name}`,
      () => {
        index100000.delete(doc);
      },
      { iterations: 1000 },
    );
  }

  {
    const doc = getMiddleDoc(testData10000);
    bench(`10000 docs - ${doc.name}`, () => {
      index10000.delete(doc);
    });
  }

  {
    const doc = getMiddleDoc(testData1000);
    bench(`1000 docs - ${doc.name}`, () => {
      index1000.delete(doc);
    });
  }

  // Nothing (does not exist)
  bench(
    "100000 docs - Nothing",
    () => {
      index100000.delete({ id: "Nothing", name: "Nothing" });
    },
    { iterations: 1000 },
  );

  bench("10000 docs - Nothing", () => {
    index10000.delete({ id: "Nothing", name: "Nothing" });
  });

  bench("1000 docs - Nothing", () => {
    index1000.delete({ id: "Nothing", name: "Nothing" });
  });
});
