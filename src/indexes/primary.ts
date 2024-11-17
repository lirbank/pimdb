import { BaseDocument, Index } from "../pimdb";

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
