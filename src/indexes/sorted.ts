import { BaseDocument, Index } from "../pimdb";

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
