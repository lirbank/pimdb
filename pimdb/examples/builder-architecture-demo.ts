import { BaseDocument } from "../src/pimdb";

/**
 * Base interface that all indexes must implement
 */
export interface BaseIndex<T extends BaseDocument> {
  insert(doc: T): boolean;
  update(doc: T): boolean;
  delete(doc: T): boolean;
}

/**
 * Type-safe read-only view of an index
 */
export type ReadOnlyIndex<I> = Omit<I, "insert" | "update" | "delete">;

/**
 * Factory interface for creating indexes
 */
export interface IndexFactory<
  T extends BaseDocument,
  I extends BaseIndex<T> = BaseIndex<T>,
> {
  create(): I;
}

/**
 * Collection with type-safe indexes
 */
export class TypedCollection<
  T extends BaseDocument,
  TIndexes extends Record<string, BaseIndex<T>>,
> {
  private indexes: TIndexes;
  private primary: ReadOnlyIndex<TIndexes["primary"]>;

  constructor(indexes: TIndexes) {
    if (!("primary" in indexes)) {
      throw new Error('A primary index under the key "primary" is required');
    }
    this.indexes = indexes;
    this.primary = this.createReadOnlyView(indexes["primary"]) as ReadOnlyIndex<
      TIndexes["primary"]
    >;
  }

  private createReadOnlyView<I extends BaseIndex<T>>(
    index: I,
  ): ReadOnlyIndex<I> {
    return new Proxy(index, {
      get(target, prop: string) {
        if (prop === "insert" || prop === "update" || prop === "delete") {
          return undefined;
        }
        const orig = (target as Record<string, unknown>)[prop];
        if (typeof orig === "function") {
          return (...args: unknown[]) => {
            const result = (orig as (...args: unknown[]) => unknown).apply(
              target,
              args,
            );
            return structuredClone(result);
          };
        }
        return orig;
      },
    }) as ReadOnlyIndex<I>;
  }

  getIndex<Name extends keyof TIndexes>(
    name: Name,
  ): ReadOnlyIndex<TIndexes[Name]> {
    const index = this.indexes[name];
    if (!index) {
      throw new Error(`Index "${String(name)}" not found`);
    }
    return this.createReadOnlyView(index);
  }

  insert(doc: T): boolean {
    const clone = structuredClone(doc);
    let success = true;
    for (const index of Object.values(this.indexes)) {
      if (!index.insert(clone)) {
        success = false;
      }
    }
    return success;
  }

  update(doc: T): boolean {
    const clone = structuredClone(doc);
    let success = true;
    for (const index of Object.values(this.indexes)) {
      if (!index.update(clone)) {
        success = false;
      }
    }
    return success;
  }

  delete(id: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = (this.primary as any).get(id);
    if (!doc) return false;

    let success = true;
    for (const index of Object.values(this.indexes)) {
      if (!index.delete(doc)) {
        success = false;
      }
    }
    return success;
  }

  get(id: string): T | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.primary as any).get(id);
  }

  all(): T[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.primary as any).all() || [];
  }
}

/**
 * Collection builder with full type safety
 */
export class TypedCollectionBuilder<
  T extends BaseDocument,
  TIndexes extends Record<string, BaseIndex<T>> = Record<never, never>,
> {
  private indexes: TIndexes;

  constructor(indexes: TIndexes = {} as TIndexes) {
    this.indexes = indexes;
  }

  add<Name extends string, I extends BaseIndex<T>>(
    name: Name,
    factory: IndexFactory<T, I>,
  ): TypedCollectionBuilder<T, TIndexes & Record<Name, I>> {
    const newIndexes = {
      ...this.indexes,
      [name]: factory.create(),
    } as TIndexes & Record<Name, I>;

    return new TypedCollectionBuilder<T, TIndexes & Record<Name, I>>(
      newIndexes,
    );
  }

  build(): TypedCollection<T, TIndexes> {
    return new TypedCollection<T, TIndexes>(this.indexes);
  }
}

/**
 * Factory function to create a new collection builder
 */
export function createTypedCollection<
  T extends BaseDocument,
>(): TypedCollectionBuilder<T> {
  return new TypedCollectionBuilder<T>();
}

// ============================================================================
// BUILT-IN INDEXES (pimdb/src/indexes/*.ts)
// ============================================================================
// These are provided by the PimDB library - users can use these out of the box

/**
 * Built-in hash index for primary key lookups
 */
export class HashIndex<T extends BaseDocument> implements BaseIndex<T> {
  private data = new Map<string, T>();

  insert(doc: T): boolean {
    if (this.data.has(doc.id)) return false;
    this.data.set(doc.id, doc);
    return true;
  }

  update(doc: T): boolean {
    if (!this.data.has(doc.id)) return false;
    this.data.set(doc.id, doc);
    return true;
  }

  delete(doc: T): boolean {
    return this.data.delete(doc.id);
  }

  get(id: string): T | undefined {
    return this.data.get(id);
  }

  all(): T[] {
    return Array.from(this.data.values());
  }
}

/**
 * Built-in sorted index for range queries
 */
export class SortedIndex<T extends BaseDocument> implements BaseIndex<T> {
  private data: T[] = [];
  private field: keyof T;

  constructor(field: keyof T) {
    this.field = field;
  }

  insert(doc: T): boolean {
    this.data.push(doc);
    this.data.sort((a, b) => {
      const aVal = a[this.field];
      const bVal = b[this.field];
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });
    return true;
  }

  update(doc: T): boolean {
    const index = this.data.findIndex((d) => d.id === doc.id);
    if (index === -1) return false;
    this.data[index] = doc;
    this.data.sort((a, b) => {
      const aVal = a[this.field];
      const bVal = b[this.field];
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });
    return true;
  }

  delete(doc: T): boolean {
    const index = this.data.findIndex((d) => d.id === doc.id);
    if (index === -1) return false;
    this.data.splice(index, 1);
    return true;
  }

  find(value?: T[keyof T]): T[] {
    if (value === undefined) return [...this.data];
    return this.data.filter((doc) => doc[this.field] === value);
  }

  findInRange(range: { gte?: T[keyof T]; lte?: T[keyof T] } = {}): T[] {
    return this.data.filter((doc) => {
      const val = doc[this.field];
      if (range.gte !== undefined && val < range.gte!) return false;
      if (range.lte !== undefined && val > range.lte!) return false;
      return true;
    });
  }
}

// Built-in factories
export class HashIndexFactory<T extends BaseDocument>
  implements IndexFactory<T, HashIndex<T>>
{
  create(): HashIndex<T> {
    return new HashIndex<T>();
  }
}

export class SortedIndexFactory<T extends BaseDocument>
  implements IndexFactory<T, SortedIndex<T>>
{
  constructor(private field: keyof T) {}

  create(): SortedIndex<T> {
    return new SortedIndex<T>(this.field);
  }
}

// ============================================================================
// CUSTOM USER INDEX (user's own code)
// ============================================================================
// This is what users create when they need custom indexing behavior

/**
 * Custom full-text search index created by a user
 * Note: Named after the operation (FullText), not the data type
 */
export class FullTextIndex<T extends BaseDocument> implements BaseIndex<T> {
  private data: T[] = [];
  private searchField: keyof T;

  constructor(searchField: keyof T) {
    this.searchField = searchField;
  }

  insert(doc: T): boolean {
    this.data.push(doc);
    return true;
  }

  update(doc: T): boolean {
    const index = this.data.findIndex((d) => d.id === doc.id);
    if (index === -1) return false;
    this.data[index] = doc;
    return true;
  }

  delete(doc: T): boolean {
    const index = this.data.findIndex((d) => d.id === doc.id);
    if (index === -1) return false;
    this.data.splice(index, 1);
    return true;
  }

  // Custom methods specific to full-text search
  search(query: string): T[] {
    return this.data.filter((doc) => {
      const fieldValue = String(doc[this.searchField]);
      return fieldValue.toLowerCase().includes(query.toLowerCase());
    });
  }

  getByPrefix(prefix: string): T[] {
    return this.data.filter((doc) => {
      const fieldValue = String(doc[this.searchField]);
      return fieldValue.toLowerCase().startsWith(prefix.toLowerCase());
    });
  }
}

/**
 * Custom factory for the user's full-text index
 */
export class FullTextIndexFactory<T extends BaseDocument>
  implements IndexFactory<T, FullTextIndex<T>>
{
  constructor(private searchField: keyof T) {}

  create(): FullTextIndex<T> {
    return new FullTextIndex<T>(this.searchField);
  }
}

// ============================================================================
// USER SETUP CODE (user's database configuration)
// ============================================================================
// This is where users define their document types and set up collections

// User defines their document types
interface User extends BaseDocument {
  id: string;
  name: string;
  email: string;
  age: number;
}

interface Post extends BaseDocument {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

// User sets up their collections using built-in and custom indexes
const userCollection = createTypedCollection<User>()
  .add("primary", new HashIndexFactory<User>())
  .add("byName", new SortedIndexFactory<User>("name"))
  .add("byAge", new SortedIndexFactory<User>("age"))
  .add("search", new FullTextIndexFactory<User>("name")) // Custom index!
  .build();

const postCollection = createTypedCollection<Post>()
  .add("primary", new HashIndexFactory<Post>())
  .add("byTitle", new SortedIndexFactory<Post>("title"))
  .add("byAuthor", new SortedIndexFactory<Post>("authorId"))
  .add("contentSearch", new FullTextIndexFactory<Post>("content")) // Same custom index type!
  .build();

// ============================================================================
// USER USAGE CODE (user's application logic)
// ============================================================================
// This is where users actually use their database

// Insert data
userCollection.insert({
  id: "1",
  name: "Alice",
  email: "alice@example.com",
  age: 30,
});
userCollection.insert({
  id: "2",
  name: "Bob",
  email: "bob@example.com",
  age: 25,
});
userCollection.insert({
  id: "3",
  name: "Charlie",
  email: "charlie@example.com",
  age: 35,
});

postCollection.insert({
  id: "1",
  title: "Hello World",
  content: "This is my first post",
  authorId: "1",
  createdAt: new Date(),
});

// Use built-in index methods
const alice = userCollection.getIndex("byName").find("Alice");
const youngUsers = userCollection.getIndex("byAge").findInRange({ lte: 30 });

// Use custom index methods (NO CORE CODE MODIFICATION NEEDED!)
const searchResults = userCollection.getIndex("search").search("al");
const prefixResults = userCollection.getIndex("search").getByPrefix("A");

// Same custom index works with different document types
const contentResults = postCollection.getIndex("contentSearch").search("first");

console.log("=== Built-in Index Usage ===");
console.log("Alice:", alice);
console.log("Young users:", youngUsers);

console.log("\n=== Custom Index Usage ===");
console.log("Search results:", searchResults);
console.log("Prefix results:", prefixResults);
console.log("Content search:", contentResults);

console.log("\n=== Type Safety Examples ===");
console.log("✅ All method calls are type-safe");
console.log("✅ Custom methods preserved without core code changes");
console.log("✅ Same index types work with different document types");
console.log("✅ Document type mixing is prevented at compile time");
