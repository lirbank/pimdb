import { bench, describe } from "vitest";
import { PimSubstringIndex } from "./substring";
import testData100000 from "./benchmarks/benchmark-data.json";
import { makeSubstringPredicate, Spaceship } from "./shared";
const unsortedDocs = testData100000 as Spaceship[];

// The number of documents to test
const marks = [1000, 10000, 100000];

const query = "Nostromo";
const indexField: keyof Spaceship = "name";
const predicate = makeSubstringPredicate(indexField)(query);

/**
 * search
 */
describe.each(marks)(`substring.search on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSubstringIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  bench(
    `array.filter ${count}`,
    () => {
      docs.filter(predicate);
    },
    { iterations: 1000 },
  );

  bench(
    `substring.search ${count}`,
    () => {
      index.search(query);
    },
    { iterations: 1000 },
  );
});
