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

const predicate = (doc: Spaceship) => doc.name === "Nostromo";

/**
 * index.find vs array.filter on 1000 docs
 */
describe("index.find vs array.filter on 1000 docs", () => {
  const unsortedDocs = testData1000;
  const index = new PimSortedIndex<Spaceship>("name");
  unsortedDocs.forEach((doc) => index.insert(doc));

  bench("array.filter", () => {
    unsortedDocs.filter(predicate);
  });

  bench("index.find", () => {
    index.find("Nostromo");
  });
});

/**
 * index.find vs array.filter on 10000 docs
 */
describe("index.find vs array.filter on 10000 docs", () => {
  const unsortedDocs = testData10000;
  const index = new PimSortedIndex<Spaceship>("name");
  unsortedDocs.forEach((doc) => index.insert(doc));

  bench("array.filter", () => {
    unsortedDocs.filter(predicate);
  });

  bench("index.find", () => {
    index.find("Nostromo");
  });
});

/**
 * index.find vs array.filter on 100000 docs
 */
describe("index.find vs array.filter on 100000 docs", () => {
  const unsortedDocs = testData100000;
  const index = new PimSortedIndex<Spaceship>("name");
  unsortedDocs.forEach((doc) => index.insert(doc));

  bench("array.filter", () => {
    unsortedDocs.filter(predicate);
  });

  bench("index.find", () => {
    index.find("Nostromo");
  });
});