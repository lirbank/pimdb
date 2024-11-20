import { PimPrimaryIndex } from "./indexes/primary";

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
  insert(item: T): boolean;
  update(item: T): boolean;
  delete(item: T): boolean;
}

/**
 * Collection
 *
 * This is a collection of documents with indexes.
 */
export class PimCollection<
  T extends BaseDocument,
  TIndexes extends Record<string, Index<T>>,
> implements Index<T>
{
  indexes: TIndexes;
  primary: PimPrimaryIndex<T>;

  constructor(indexes: TIndexes) {
    this.indexes = indexes;

    const primary = Object.values(this.indexes).find(
      (index) => index instanceof PimPrimaryIndex,
    );
    if (!primary) throw new Error("Primary index not found");

    this.primary = primary;
  }

  insert(doc: T): boolean {
    if (this.primary.get(doc.id)) return false;

    for (const index of Object.values(this.indexes)) {
      index.insert(doc);
    }

    return true;
  }

  update(doc: T): boolean {
    if (!this.primary.get(doc.id)) return false;

    for (const index of Object.values(this.indexes)) {
      index.update(doc);
    }

    return true;
  }

  delete(doc: T): boolean {
    if (!this.primary.get(doc.id)) return false;

    for (const index of Object.values(this.indexes)) {
      index.delete(doc);
    }

    return true;
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
