import { BaseDocument, PimIndex } from "../pimdb";

/**
 * Primary Index
 *
 * This is a unique index.
 *
 * Write operations store document references, allowing documents to be shared
 * across multiple indexes. Documents are never mutated, replacing a document
 * swaps the stored reference.
 *
 * Read operations return references (not clones) to the indexed documents.
 */
export class PimPrimaryIndex<T extends BaseDocument> implements PimIndex<T> {
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
   * Replace a document in the index.
   *
   * Returns true if the document was replaced, false if it was not found.
   */
  replace(prev: T, next: T): boolean {
    if (!this.map.has(prev.id)) return false;

    // Setting an existing key keeps its insertion order.
    this.map.set(next.id, next);

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
  all(): T[] {
    return Array.from(this.map.values());
  }
}
