import { BaseDocument, Index } from "../pimdb";

/**
 * Primary Index
 *
 * This is a unique index.
 *
 * Write operations work with document references, mutating the documents in
 * place, allowing documents to be shared across multiple indexes.
 *
 * Read operations return a new array containing references (not clones) to the
 * indexed documents.
 */
export class PrimaryIndex<T extends BaseDocument> implements Index<T> {
  private map = new Map<T["id"], T>();

  insert(doc: T): boolean {
    if (this.map.has(doc.id)) return false;

    this.map.set(doc.id, doc);

    return true;
  }

  update(doc: T): boolean {
    const existing = this.map.get(doc.id);
    if (!existing) return false;

    // Mutate the existing object in place.
    Object.assign(existing, doc);

    return true;
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
