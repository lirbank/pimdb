/**
 * BaseDocument
 */
export interface BaseDocument {
  /** Primary key */
  id: string;
}

/**
 * Index interface
 */
export interface Index<T> {
  insert(item: T): void;
  update(item: T): void;
  delete(item: T): void;
}

/**
 * Collection
 *
 * This is a collection of documents with indexes.
 */
export class PimCollection<
  T extends BaseDocument,
  TIndexes extends Record<string, Index<T>>,
> {
  indexes: TIndexes;

  constructor(indexes: TIndexes) {
    this.indexes = indexes;
  }

  insert(doc: T): void {
    for (const index of Object.values(this.indexes)) {
      index.insert(doc);
    }
  }

  update(doc: T): void {
    for (const index of Object.values(this.indexes)) {
      index.update(doc);
    }
  }

  delete(doc: T): void {
    for (const index of Object.values(this.indexes)) {
      index.delete(doc);
    }
  }
}

/**
 * Database
 *
 * This is a database of collections.
 */
class PimDB<
  TCollections extends Record<
    string,
    PimCollection<BaseDocument, Record<string, Index<BaseDocument>>>
  >,
> {
  constructor(collections: TCollections) {
    Object.assign(this, collections);
  }
}

/**
 * Factory function to create PimDB instances
 */
export function createPimDB<
  TCollections extends Record<
    string,
    PimCollection<BaseDocument, Record<string, Index<BaseDocument>>>
  >,
>(collections: TCollections): PimDB<TCollections> & TCollections {
  return Object.assign(new PimDB(collections), collections);
}
