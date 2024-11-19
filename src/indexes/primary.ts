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

  /**
   * Insert a document into the index.
   *
   * Returns true if the document was updated, false if it was not found.
   */
  insert(doc: T): boolean {
    if (this.map.has(doc.id)) return false;

    this.map.set(doc.id, doc);

    return true;
  }

  /**
   * Update a document in the index.
   *
   * Returns true if the document was updated, false if it was not found.
   */
  update(doc: T): boolean {
    const existing = this.map.get(doc.id);
    if (!existing) return false;

    // Mutate the existing object in place.
    Object.assign(existing, doc);

    return true;
  }

  /**
   * Delete a document from the index.
   *
   * Returns true if the document was deleted, false if it was not found.
   */
  delete(doc: T): boolean {
    return this.map.delete(doc.id);
  }

  /**
   * Get a document from the index by id.
   */
  get(id: T["id"]): T | undefined {
    return this.map.get(id);
  }

  /**
   * Get all documents from the index.
   */
  getAll(): T[] {
    return Array.from(this.map.values());
  }
}
