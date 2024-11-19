import { BaseDocument, Index } from "../pimdb";

/**
 * Text Index
 *
 * This is a plain partial text search index.
 *
 * It is not a full-text search index and as such does not support advanced
 * features like stemming, synonyms, or relevance scoring.
 */
export class PimTextIndex<T extends BaseDocument> implements Index<T> {
  private documents: T[] = [];
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

  /**
   * Insert a document into the index.
   *
   * Returns true if the document was updated, false if it was not found.
   */
  insert(doc: T): boolean {
    if (this.documents.find((d) => d.id === doc.id)) {
      return false;
    }

    this.documents.push(doc);

    return true;
  }

  /**
   * Update a document in the index.
   *
   * Returns true if the document was updated, false if it was not found.
   */
  update(doc: T): boolean {
    const index = this.documents.findIndex((d) => d.id === doc.id);

    if (index === -1) {
      return false;
    }

    this.documents[index] = doc;

    return true;
  }

  /**
   * Delete a document from the index.
   *
   * Returns true if the document was deleted, false if it was not found.
   */
  delete(doc: T): boolean {
    const index = this.documents.findIndex((d) => d.id === doc.id);

    if (index === -1) {
      return false;
    }

    this.documents.splice(index, 1);

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
    if (query === "") {
      return [...this.documents];
    }

    return this.documents.filter((doc) => {
      const fieldValue = doc[this.indexField];

      if (typeof fieldValue !== "string") return false;

      return fieldValue.toLowerCase().includes(query.toLowerCase());
    });
  }
}
