import { bench, describe } from "vitest";
import { PimSortedIndex } from "./sorted";
import testData1000 from "./benchmarks/benchmark-data-1000.json";
import testData10000 from "./benchmarks/benchmark-data-10000.json";
import testData100000 from "./benchmarks/benchmark-data-100000.json";

interface Spaceship {
  id: string;
  name: string;
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
    index100000.findInRange("Nostromo", "Nostromo");
  });

  bench("10000 docs - Nostromo", () => {
    index10000.findInRange("Nostromo", "Nostromo");
  });

  bench("1000 docs - Nostromo", () => {
    index1000.findInRange("Nostromo", "Nostromo");
  });

  // Nothing (does not exist)
  bench("100000 docs - Nothing", () => {
    index100000.findInRange("Nothing", "Nothing");
  });

  bench("10000 docs - Nothing", () => {
    index10000.findInRange("Nothing", "Nothing");
  });

  bench("1000 docs - Nothing", () => {
    index1000.findInRange("Nothing", "Nothing");
  });
});
