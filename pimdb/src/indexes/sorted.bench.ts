import { bench, describe } from "vitest";
import { PimSortedIndex } from "./sorted";
import testData1000 from "./benchmarks/benchmark-data-1000.json";
import testData10000 from "./benchmarks/benchmark-data-10000.json";
import testData100000 from "./benchmarks/benchmark-data-100000.json";

interface Spaceship {
  id: string;
  name: string;
}

const testData = {
  1000: testData1000,
  10000: testData10000,
  // VSCode doesn't infer the types from the larger JSON file, so casting it
  100000: testData100000 as Spaceship[],
};

const query = "Nostromo";
const indexField = "name";
const predicate = (doc: Spaceship) => doc[indexField] === query;

function indexFactory(docCount: keyof typeof testData) {
  const unsortedDocs = testData[docCount];

  const index = new PimSortedIndex<Spaceship>(indexField);
  unsortedDocs.forEach((doc) => index.insert(doc));

  return { index, unsortedDocs };
}

/**
 * index.find vs array.filter on 1000 docs
 */
describe.skip(`index.find vs array.filter on 1000 docs`, () => {
  const { index, unsortedDocs } = indexFactory(1000);

  bench("array.filter", () => {
    unsortedDocs.filter(predicate);
  });

  bench("index.find", () => {
    index.find(query);
  });
});

/**
 * index.find vs array.filter on 10000 docs
 */
describe.skip(`index.find vs array.filter on 10000 docs`, () => {
  const { index, unsortedDocs } = indexFactory(10000);

  bench("array.filter", () => {
    unsortedDocs.filter(predicate);
  });

  bench("index.find", () => {
    index.find(query);
  });
});

/**
 * index.find vs array.filter on 100000 docs
 */
describe(`index.find vs array.filter on 100000 docs`, () => {
  const { index, unsortedDocs } = indexFactory(100000);

  bench("array.filter", () => {
    unsortedDocs.filter(predicate);
  });

  bench("index.find", () => {
    index.find(query);
  });
});

/**
 * findInRange
 */
describe.skip(`findInRange on 1000 docs`, () => {
  const { index } = indexFactory(1000);

  bench(`findInRange Nostromo - Nostromo`, () => {
    index.findInRange({ gte: "Nostromo", lte: "Nostromo" });
  });
});

describe.skip(`findInRange on 10000 docs`, () => {
  const { index } = indexFactory(10000);

  bench(`findInRange Nostromo - Nostromo`, () => {
    index.findInRange({ gte: "Nostromo", lte: "Nostromo" });
  });
});

describe.skip(`findInRange on 100000 docs`, () => {
  const { index } = indexFactory(100000);

  bench(`findInRange Nostromo - Nostromo`, () => {
    index.findInRange({ gte: "Nostromo", lte: "Nostromo" });
  });
});

/**
 * insert
 */
describe.skip(`insert on 1000 docs`, () => {
  const { index } = indexFactory(1000);

  bench(`insert - Nostromo`, () => {
    index.insert({ id: "some-id", name: "Nostromo" });
  });
});

describe.skip(`insert on 10000 docs`, () => {
  const { index } = indexFactory(10000);

  bench(`insert - Nostromo`, () => {
    index.insert({ id: "some-id", name: "Nostromo" });
  });
});

describe.skip(`insert on 100000 docs`, () => {
  const { index } = indexFactory(100000);

  bench(`insert - Nostromo`, () => {
    index.insert({ id: "some-id", name: "Nostromo" });
  });
});

/**
 * update
 */
describe.skip(`update on 1000 docs`, () => {
  const { index } = indexFactory(1000);

  bench(`update - Nostromo`, () => {
    index.update({ id: "some-id", name: "Nostromo" });
  });
});

describe.skip(`update on 10000 docs`, () => {
  const { index } = indexFactory(10000);

  bench(`update - Nostromo`, () => {
    index.update({ id: "some-id", name: "Nostromo" });
  });
});

describe.skip(`update on 100000 docs`, () => {
  const { index } = indexFactory(100000);

  bench(`update - Nostromo`, () => {
    index.update({ id: "some-id", name: "Nostromo" });
  });
});

/**
 * delete
 */
function getMiddleDoc(arr: Spaceship[]) {
  return arr[Math.floor(arr.length / 2)]!;
}

describe.skip(`delete on 1000 docs`, () => {
  const { index, unsortedDocs } = indexFactory(1000);
  const doc = getMiddleDoc(unsortedDocs);

  bench(`delete - ${doc.name}`, () => {
    index.delete(doc);
  });
});

describe.skip(`delete on 10000 docs`, () => {
  const { index, unsortedDocs } = indexFactory(10000);
  const doc = getMiddleDoc(unsortedDocs);

  bench(`delete - ${doc.name}`, () => {
    index.delete(doc);
  });
});

describe.skip(`delete on 100000 docs`, () => {
  const { index, unsortedDocs } = indexFactory(100000);
  const doc = getMiddleDoc(unsortedDocs);

  bench(`delete - ${doc.name}`, () => {
    index.delete(doc);
  });
});
