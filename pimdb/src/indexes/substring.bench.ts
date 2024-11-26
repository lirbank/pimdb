import { bench, describe } from "vitest";
import { PimSubstringIndex } from "./substring";
import testData100000 from "./benchmarks/benchmark-data.json";
import {
  getMiddleDoc,
  makeSubstringPredicate,
  Spaceship,
} from "../test-helpers";
const unsortedDocs = testData100000 as Spaceship[];

// The number of documents to test
const marks = [1000, 10000, 100000];

const query = "Nostromo";
const indexField: keyof Spaceship = "name";
const predicate = makeSubstringPredicate(indexField)(query);

/**
 * substring.search
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

/**
 * substring.insert
 */
describe.each(marks)(`substring.insert on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSubstringIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  bench(
    `substring.insert ${count}`,
    () => {
      index.insert({ id: "some-id", name: "Nostromo" });
    },
    { iterations: 1000 },
  );
});

/**
 * substring.update
 */
describe.each(marks)(`substring.update on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSubstringIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  const doc = getMiddleDoc(docs);
  bench(
    `substring.update ${count}`,
    () => {
      index.update({ id: doc.id, name: "Nostromo" });
    },
    { iterations: 1000 },
  );
});

/**
 * substring.delete
 */
describe.each(marks)(`substring.delete on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSubstringIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  const doc = getMiddleDoc(docs);
  bench(
    `substring.delete ${count}`,
    () => {
      index.delete(doc);
    },
    { iterations: 1000 },
  );
});
