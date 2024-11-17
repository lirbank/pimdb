/**
 * BaseDocument
 */
interface BaseDocument {
  /** Primary key */
  id: string;
}

/**
 * Index interface
 */
interface Index<T> {
  insert(item: T): void;
  update(item: T): void;
  delete(item: T): void;
}

/**
 * Primary Index
 *
 * This is a unique primary index.
 */
export class PrimaryIndex<T extends BaseDocument> implements Index<T> {
  private map = new Map<T["id"], T>();

  insert(doc: T): void {
    if (this.map.has(doc.id)) {
      throw new Error(`Duplicate primary key: ${doc.id}`);
    }
    this.map.set(doc.id, doc);
  }

  update(doc: T): void {
    if (!this.map.has(doc.id)) {
      throw new Error(`Record with primary key ${doc.id} does not exist`);
    }
    this.map.set(doc.id, doc);
  }

  /**
   * @returns true if the record was deleted, false if it did not exist
   */
  delete(doc: T): boolean {
    return this.map.delete(doc.id);
  }

  get(id: T["id"]): T | undefined {
    return this.map.get(id);
  }

  getAll(): T[] {
    return Array.from(this.map.values());
  }
}

/**
 * Sorted Index
 *
 * This is a regular index.
 */
export class PimSortedIndex<T extends BaseDocument> implements Index<T> {
  private indexKey: keyof T;

  constructor(indexKey: keyof T) {
    this.indexKey = indexKey;
  }

  insert(doc: T): void {
    console.log("insert", doc);
    // TODO: Implement
  }

  update(doc: T): void {
    console.log("update", doc);
    // TODO: Implement
  }

  delete(doc: T): void {
    console.log("delete", doc);
    // TODO: Implement
  }

  find(value: T[typeof this.indexKey]): T[] {
    console.log("find", value);
    return [];
  }

  findInRange(
    start?: T[typeof this.indexKey],
    end?: T[typeof this.indexKey],
  ): T[] {
    console.log("findInRange", start, end);
    return [];
  }
}

/**
 * Text Index
 *
 * This is a plain partial text search index.
 *
 * It is not a full-text search index
 * and does not support advanced features like stemming, synonyms, or relevance
 * scoring.
 */
export class PimTextIndex<T extends BaseDocument> implements Index<T> {
  private indexKey: {
    [K in keyof T]: T[K] extends string ? K : never;
  }[keyof T];

  constructor(
    indexKey: { [K in keyof T]: T[K] extends string ? K : never }[keyof T],
  ) {
    this.indexKey = indexKey;
    console.log(this.indexKey);
    // TODO: Implement
  }

  insert(doc: T): void {
    console.log("insert", doc);
    // TODO: Implement
  }

  update(doc: T): void {
    console.log("update", doc);
    // TODO: Implement
  }

  delete(doc: T): void {
    console.log("delete", doc);
    // TODO: Implement
  }

  search(
    query: string,
    options?: {
      caseSensitive?: boolean;
      exact?: boolean;
      limit?: number;
    },
  ): T[] {
    console.log("search", query, options);
    return [];
    // TODO: Implement
  }
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
