import { bench, describe } from "vitest";
import { PimSubstringIndex } from "./substring";
import testData100000 from "./benchmarks/benchmark-data-100000.json";
const unsortedDocs = testData100000 as Spaceship[];

// The number of documents to test
const marks = [1000, 10000, 100000];

interface Spaceship {
  id: string;
  name: string;
}

const makePredicate =
  (indexField: keyof Spaceship) => (query: string) => (doc: Spaceship) =>
    doc[indexField].toLowerCase().includes(query.toLowerCase());

const indexField: keyof Spaceship = "name";
const query = "Nostromo";
const predicate = makePredicate(indexField)(query);

marks.forEach((count) => {
  describe(`substring.search on ${count} docs`, () => {
    const docs = unsortedDocs.slice(0, count);

    const index = new PimSubstringIndex<Spaceship>(indexField);
    docs.forEach((doc) => index.insert(doc));

    bench(`array.filter ${count}`, () => {
      docs.filter(predicate);
    });

    bench(`index.search ${count}`, () => {
      index.search(query);
    });
  });
});
