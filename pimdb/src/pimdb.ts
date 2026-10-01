import { PimPrimaryIndex } from "./indexes/primary";

// SimpleEventEmitter.ts
type Listener = () => void;

export class SimpleEventEmitter {
  private listeners: Set<Listener> = new Set();

  addListener(listener: Listener) {
    this.listeners.add(listener);
  }

  removeListener(listener: Listener) {
    this.listeners.delete(listener);
  }

  protected emit() {
    this.listeners.forEach((listener) => listener());
  }
}

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
export interface PimIndex<T> {
  insert(doc: T): boolean;
  update(doc: T): boolean;
  delete(doc: T): boolean;
}

/**
 * Collection
 *
 * This is a collection of documents with indexes.
 */
export class PimCollection<
  T extends BaseDocument,
  TIndexes extends Record<string, PimIndex<T>>,
> extends SimpleEventEmitter {
  indexes: TIndexes;
  primary: PimPrimaryIndex<T>;

  constructor(indexes: TIndexes) {
    super();

    this.indexes = indexes;

    const primary = Object.values(this.indexes).find(
      (index) => index instanceof PimPrimaryIndex,
    );
    if (!primary) throw new Error("Primary index not found");

    this.primary = primary;
  }

  insert(doc: T): boolean {
    if (this.primary.get(doc.id)) return false;

    const clonedDoc = structuredClone(doc);

    for (const index of Object.values(this.indexes)) {
      index.insert(clonedDoc);
    }

    this.emit();

    return true;
  }

  update(doc: T): boolean {
    if (!this.primary.get(doc.id)) return false;

    const clonedDoc = structuredClone(doc);

    for (const index of Object.values(this.indexes)) {
      index.update(clonedDoc);
    }

    this.emit();

    return true;
  }

  delete(id: string): boolean {
    const doc = this.primary.get(id);
    if (!doc) return false;

    for (const index of Object.values(this.indexes)) {
      index.delete(doc);
    }

    this.emit();

    return true;
  }
}

/**
 * Database
 *
 * This is a database of collections.
 */
export class PimDB<
  TCollections extends Record<
    string,
    PimCollection<BaseDocument, Record<string, PimIndex<BaseDocument>>>
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
    PimCollection<BaseDocument, Record<string, PimIndex<BaseDocument>>>
  >,
>(collections: TCollections): PimDB<TCollections> & TCollections {
  return Object.assign(new PimDB(collections), collections);
}
