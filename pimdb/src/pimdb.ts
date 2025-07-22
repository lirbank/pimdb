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
export interface PimIndex<T> {
  insert(doc: T): boolean;
  update(doc: T): boolean;
  delete(doc: T): boolean;
}

/**
 * Public "read‐only" view of an index, omitting the mutation methods so
 * callers can only read.
 */
type SafeIndex<I> = Omit<I, "insert" | "update" | "delete">;

/**
 * Collection
 *
 * This is a collection of documents with indexes.
 */
export class PimCollection<
  T extends BaseDocument,
  TIndexes extends Record<string, PimIndex<T>>,
> {
  private indexes: TIndexes;
  private primary: PimPrimaryIndex<T>;

  constructor(indexes: TIndexes) {
    if (!("primary" in indexes)) {
      throw new Error(`A primary index under the key "primary" is required`);
    }

    if (indexes["primary"] instanceof PimPrimaryIndex) {
      this.primary = indexes["primary"];
    } else {
      throw new Error(`Primary index must be a PimPrimaryIndex`);
    }

    this.indexes = indexes;

    const primary = Object.values(this.indexes).find(
      (index) => index instanceof PimPrimaryIndex,
    );
    if (!primary) throw new Error("Primary index not found");

    this.primary = primary;
  }

  insert(record: T): boolean {
    if (this.primary.get(record.id)) return false;

    const clone = structuredClone(record);

    // Update all indexes
    for (const idx of Object.values(this.indexes)) {
      idx.insert(clone);
    }

    return true;
  }

  update(record: T): boolean {
    if (!this.primary.get(record.id)) return false;

    const clone = structuredClone(record);

    // Update all indexes
    for (const idx of Object.values(this.indexes)) {
      idx.update(clone);
    }

    return true;
  }

  delete(id: string): boolean {
    const record = this.primary.get(id);
    if (!record) return false;

    // Update all indexes
    for (const idx of Object.values(this.indexes)) {
      idx.delete(record);
    }

    return true;
  }

  get(id: string): T | undefined {
    const raw = this.primary.get(id);
    return raw ? structuredClone(raw) : undefined;
  }

  all(): T[] {
    return structuredClone(this.primary.all());
  }

  getIndex<Name extends keyof TIndexes>(name: Name): SafeIndex<TIndexes[Name]> {
    const idx = this.indexes[name as string];
    if (!idx) {
      throw new Error(`Index "${String(name)}" not found`);
    }

    return new Proxy(idx, {
      get(target, prop: string) {
        // never expose mutation APIs
        if (prop === "insert" || prop === "update" || prop === "delete") {
          return undefined;
        }
        const orig = (target as unknown as Record<string, unknown>)[prop] as
          | ((...args: unknown[]) => unknown)
          | undefined;
        if (typeof orig !== "function") {
          return undefined;
        }
        // Wrap any method call, clone its return value:
        return (...args: unknown[]) => {
          const result = orig.apply(target, args);
          return structuredClone(result);
        };
      },
    }) as unknown as SafeIndex<TIndexes[Name]>;
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
