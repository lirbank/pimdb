import { BaseDocument, Index } from "../pimdb";

/**
 * Text Index
 *
 * This is a plain partial text search index.
 *
 * It is not a full-text search index
 * and does not support advanced features like stemming, synonyms, or relevance
 * scoring.
 */
export class PimTextIndex<T extends BaseDocument> implements Index<T> {
  private indexKey: {
    [K in keyof T]: T[K] extends string ? K : never;
  }[keyof T];

  constructor(
    indexKey: {
      [K in keyof T]: T[K] extends string ? K : never;
    }[keyof T],
  ) {
    this.indexKey = indexKey;
    console.log(this.indexKey);
    // TODO: Implement
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

  search(
    query: string,
    options?: {
      caseSensitive?: boolean;
      exact?: boolean;
      limit?: number;
    },
  ): T[] {
    console.log("search", query, options);
    return [];
    // TODO: Implement
  }
}
