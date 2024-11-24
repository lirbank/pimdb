import { bench, describe } from "vitest";
import { PimSortedIndex } from "./sorted";
import testData100000 from "./benchmarks/benchmark-data-100000.json";
import { getMiddleDoc, makeExactMatchPredicate, Spaceship } from "./shared";
const unsortedDocs = testData100000 as Spaceship[];

// The number of documents to test
const marks = [1000, 10000, 100000];

const query = "Nostromo";
const indexField: keyof Spaceship = "name";
const predicate = makeExactMatchPredicate(indexField)(query);

/**
 * find
 */
describe.each(marks)(`sorted.find on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSortedIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  bench(
    `array.filter ${count}`,
    () => {
      docs.filter(predicate);
    },
    { iterations: 1000 },
  );

  bench(
    `sorted.find ${count}`,
    () => {
      index.find(query);
    },
    { iterations: 1000 },
  );
});

/**
 * findInRange
 */
describe.each(marks)(`sorted.findInRange on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSortedIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  bench(
    `sorted.findInRange ${count}`,
    () => {
      index.findInRange({ gte: "Nostromo", lte: "Nostromo" });
    },
    { iterations: 1000 },
  );
});

/**
 * insert
 */
describe.each([])(`sorted.insert on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSortedIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  bench(
    `sorted.insert ${count}`,
    () => {
      index.insert({ id: "some-id", name: "Nostromo" });
    },
    { iterations: 1000 },
  );
});

/**
 * update
 */
describe.each([])(`sorted.update on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSortedIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  const doc = getMiddleDoc(docs);
  bench(
    `sorted.update ${count}`,
    () => {
      index.update({ id: doc.id, name: "Nostromo" });
    },
    { iterations: 1000 },
  );
});

/**
 * delete
 */
describe.each([])(`sorted.delete on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSortedIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  const doc = getMiddleDoc(docs);
  bench(
    `sorted.delete ${count}`,
    () => {
      index.delete(doc);
    },
    { iterations: 1000 },
  );
});
