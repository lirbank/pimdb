import { BaseDocument, Index } from "../pimdb";

/**
 * Substring Index
 *
 * A fast substring search index that enables partial text matching on document fields.
 *
 * Features:
 * - Case-insensitive matching
 * - Matches any part of the indexed text field
 * - O(1) lookup time for exact substring matches
 * - Supports document updates and deletions
 *
 * Limitations:
 * - Results are returned in insertion order
 * - Not a compound index (only supports indexing a single field)
 * - No advanced text search features (stemming, synonyms, relevance scoring)
 */
export class PimSubstringIndex<T extends BaseDocument> implements Index<T> {
  private substringMap: Map<string, Set<T>> = new Map();
  private map = new Map<T["id"], T>();
  private indexField: {
    [K in keyof T]: T[K] extends string ? K : never;
  }[keyof T];

  constructor(
    indexField: {
      [K in keyof T]: T[K] extends string ? K : never;
    }[keyof T],
  ) {
    this.indexField = indexField;
  }

  private indexDocument(doc: T) {
    const fieldValue = doc[this.indexField];
    if (typeof fieldValue !== "string") return;

    const text = fieldValue.toLowerCase();
    for (let i = 0; i < text.length; i++) {
      for (let j = i + 1; j <= text.length; j++) {
        const substring = text.slice(i, j);
        if (!this.substringMap.has(substring)) {
          this.substringMap.set(substring, new Set());
        }
        this.substringMap.get(substring)!.add(doc);
      }
    }
  }

  private removeFromIndex(doc: T) {
    const fieldValue = doc[this.indexField];
    if (typeof fieldValue !== "string") return;

    const text = fieldValue.toLowerCase();
    for (let i = 0; i < text.length; i++) {
      for (let j = i + 1; j <= text.length; j++) {
        const substring = text.slice(i, j);
        this.substringMap.get(substring)?.delete(doc);
        if (this.substringMap.get(substring)?.size === 0) {
          this.substringMap.delete(substring);
        }
      }
    }
  }

  /**
   * Insert a document into the index.
   *
   * Returns true if the document was inserted, false if it was already in the
   * index.
   */
  insert(doc: T): boolean {
    if (this.map.has(doc.id)) return false;

    this.map.set(doc.id, doc);
    this.indexDocument(doc);
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

    this.removeFromIndex(existing);
    // Mutate the existing object in place.
    Object.assign(existing, doc);
    this.indexDocument(existing);
    return true;
  }

  /**
   * Delete a document from the index.
   *
   * Returns true if the document was deleted, false if it was not found.
   */
  delete(doc: T): boolean {
    if (!this.map.has(doc.id)) return false;

    this.removeFromIndex(doc);
    this.map.delete(doc.id);
    return true;
  }

  /**
   * Search for documents by a query string.
   *
   * - An empty query string will return all documents.
   * - The query is case insensitive.
   * - The search result is currently not sorted, documents are returned in the
   *   order they were inserted (this restriction will be lifted in the future).
   */
  search(query: string): T[] {
    if (query === "") return Array.from(this.map.values());

    const matchingDocs = this.substringMap.get(query.toLowerCase());
    return matchingDocs ? Array.from(matchingDocs) : [];
  }
}
