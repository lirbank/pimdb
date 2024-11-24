import { bench, describe } from "vitest";
import { PimSortedIndex } from "./sorted";
import testData100000 from "./benchmarks/benchmark-data-100000.json";
import { getMiddleDoc, makePredicate, Spaceship } from "./shared";
const unsortedDocs = testData100000 as Spaceship[];

// The number of documents to test
const marks = [1000, 10000, 100000];

const query = "Nostromo";
const indexField: keyof Spaceship = "name";
const predicate = makePredicate(indexField)(query);

/**
 * find
 */
describe.each(marks)(`sorted.find on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSortedIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  bench(`array.filter ${count}`, () => {
    docs.filter(predicate);
  });

  bench(`index.find ${count}`, () => {
    index.find(query);
  });
});

/**
 * findInRange
 */
describe.each(marks)(`sorted.findInRange on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSortedIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  bench(`index.findInRange ${count}`, () => {
    index.findInRange({ gte: "Nostromo", lte: "Nostromo" });
  });
});

/**
 * insert
 */
describe.each(marks)(`sorted.insert on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSortedIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  bench(`index.insert ${count}`, () => {
    index.insert({ id: "some-id", name: "Nostromo" });
  });
});

/**
 * update
 */
describe.each(marks)(`sorted.update on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSortedIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  bench(`index.update ${count}`, () => {
    // TODO: This is not matching any IDs
    index.update({ id: "some-id", name: "Nostromo" });
  });
});

/**
 * delete
 */
describe.each(marks)(`sorted.delete on %d docs`, (count) => {
  const docs = unsortedDocs.slice(0, count);

  const index = new PimSortedIndex<Spaceship>(indexField);
  docs.forEach((doc) => index.insert(doc));

  bench(`index.delete ${count}`, () => {
    // TODO: This is not matching any IDs
    index.delete(getMiddleDoc(docs));
  });
});
