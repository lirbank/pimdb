import { bench, describe } from "vitest";
import { PimSubstringIndex } from "./substring";
import testData1000 from "./benchmarks/benchmark-data-1000.json";
import testData10000 from "./benchmarks/benchmark-data-10000.json";
import testData100000_ from "./benchmarks/benchmark-data-100000.json";

interface Spaceship {
  id: string;
  name: string;
}

// VSCode doesn't import the types from the larger JSON file, so we need to cast it
const testData100000 = testData100000_ as Spaceship[];

const makePredicate =
  (indexField: keyof Spaceship) => (query: string) => (doc: Spaceship) =>
    doc[indexField].toLowerCase().includes(query.toLowerCase());

const indexField = "name";
const predicate = makePredicate(indexField);
const query = "Nostromo";

/**
 * index.search vs array.filter on 1000 docs
 */
describe.skip("index.search vs array.filter on 1000 docs", () => {
  const unsortedDocs = testData1000;
  const index = new PimSubstringIndex<Spaceship>(indexField);
  unsortedDocs.forEach((doc) => index.insert(doc));

  bench("array.filter", () => {
    unsortedDocs.filter(predicate(query));
  });

  bench("index.search", () => {
    index.search(query);
  });
});

/**
 * index.search vs array.filter on 10000 docs
 */
describe.skip("index.search vs array.filter on 10000 docs", () => {
  const unsortedDocs = testData10000;
  const index = new PimSubstringIndex<Spaceship>(indexField);
  unsortedDocs.forEach((doc) => index.insert(doc));

  bench("array.filter", () => {
    unsortedDocs.filter(predicate(query));
  });

  bench("index.search", () => {
    index.search(query);
  });
});

/**
 * index.search vs array.filter on 100000 docs
 */
describe("index.search vs array.filter on 100000 docs", () => {
  const unsortedDocs = testData100000;
  const index = new PimSubstringIndex<Spaceship>(indexField);
  unsortedDocs.forEach((doc) => index.insert(doc));

  bench("array.filter", () => {
    unsortedDocs.filter(predicate(query));
  });

  bench("index.search", () => {
    index.search(query);
  });
});
