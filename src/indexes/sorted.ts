import { BaseDocument, Index } from "../pimdb";

/**
 * Sorted Index
 *
 * This index relies on binary search to find individual documents and ranges
 * of documents.
 *
 * Write operations work with document references, mutating the documents in
 * place, allowing documents to be shared across multiple indexes.
 *
 * Read operations return a new array containing references (not clones) to the
 * indexed documents.
 */
export class PimSortedIndex<T extends BaseDocument> implements Index<T> {
  private indexField: keyof T;
  private documents: T[] = [];

  constructor(indexField: keyof T) {
    this.indexField = indexField;
  }

  /**
   * Insert a document into the index.
   *
   * Returns true if the document was updated, false if it was not found.
   */
  insert(doc: T): boolean {
    const value = doc[this.indexField];
    let left = 0;
    let right = this.documents.length - 1;

    // Find insertion point using binary search
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midDoc = this.documents[mid];

      // Add null checks
      if (!midDoc) return false;

      const midValue = midDoc[this.indexField];

      if (midValue < value) {
        left = mid + 1;
      } else if (midValue > value) {
        right = mid - 1;
      } else {
        // If values are equal, compare by id
        if (midDoc.id < doc.id) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
    }

    // Insert at the correct position to maintain sorted order
    this.documents.splice(left, 0, doc);

    return true;
  }

  /**
   * Update a document in the index.
   *
   * Returns true if the document was updated, false if it was not found.
   */
  update(doc: T): boolean {
    // Find the existing document with matching id
    const existingIndex = this.documents.findIndex((d) => d.id === doc.id);
    if (existingIndex === -1) {
      return false;
    }

    const existingDoc = this.documents[existingIndex];
    if (!existingDoc) {
      throw new Error(`Invalid document at index ${existingIndex}`);
    }
    const oldValue = existingDoc[this.indexField];
    const newValue = doc[this.indexField];

    // Copy all properties from doc to existingDoc
    Object.assign(existingDoc, doc);

    // If the indexed value changed, we need to reposition the document
    if (oldValue !== newValue) {
      // Remove the document from its current position
      this.documents.splice(existingIndex, 1);
      // Reinsert it in the correct sorted position
      this.insert(existingDoc);
    }

    return true;
  }

  /**
   * Delete a document from the index.
   *
   * Returns true if the document was deleted, false if it was not found.
   */
  delete(doc: T): boolean {
    // Find and remove the existing document with matching id
    const existingIndex = this.documents.findIndex((d) => d.id === doc.id);
    if (existingIndex === -1) {
      return false;
    }

    this.documents.splice(existingIndex, 1);
    return true;
  }

  /**
   * Find documents in the index.
   *
   * - Returns all documents if no value is provided.
   * - Matches are case sensitive.
   * - Documents are secondarily sorted by id.
   */
  find(value?: T[typeof this.indexField]): T[] {
    // Special case: undefined query returns all documents
    if (value === undefined) {
      return [...this.documents];
    }

    // Normal search, including empty string values
    let left = 0;
    let right = this.documents.length - 1;
    let firstMatch = -1;

    // Find the first occurrence
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midDoc = this.documents[mid];

      // Add null check for midDoc
      if (!midDoc) {
        throw new Error(`Invalid document at index ${mid}`);
      }

      const midValue = midDoc[this.indexField];

      if (midValue === value) {
        firstMatch = mid;
        right = mid - 1;
      } else if (midValue < value!) {
        // Add non-null assertion since we checked undefined earlier
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // If no match found, return empty array
    if (firstMatch === -1) {
      return [];
    }

    // Collect all matching documents
    const results: T[] = [];
    let i = firstMatch;
    while (i < this.documents.length) {
      const doc = this.documents[i];
      if (!doc) break;
      if (doc[this.indexField] !== value) break;
      results.push(doc);
      i++;
    }

    return results;
  }

  /**
   * Find documents in a range.
   *
   * - Returns all documents if no range is provided.
   * - Matches are case sensitive.
   * - Documents are secondarily sorted by id.
   * - Includes exact matches at both boundaries.
   * - Can use either or both bounds (gte/lte).
   */
  findInRange(
    range: {
      gte?: string | number;
      lte?: string | number;
    } = {},
  ): T[] {
    // If both bounds are undefined, return all documents
    if (range.gte === undefined && range.lte === undefined) {
      return [...this.documents];
    }

    let startIndex = 0;
    let endIndex = this.documents.length;

    // Find start index if gte value is provided
    if (range.gte !== undefined) {
      let left = 0;
      let right = this.documents.length - 1;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midDoc = this.documents[mid];

        if (!midDoc) {
          throw new Error(`Invalid document at index ${mid}`);
        }

        const midValue = midDoc[this.indexField];

        // Changed comparison to find first value >= gte
        if (midValue < range.gte) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      startIndex = left;
    }

    // Find end index if lte value is provided
    if (range.lte !== undefined) {
      let left = 0;
      let right = this.documents.length - 1;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midDoc = this.documents[mid];

        if (!midDoc) {
          throw new Error(`Invalid document at index ${mid}`);
        }

        const midValue = midDoc[this.indexField];

        // Changed comparison to find first value > lte
        if (midValue <= range.lte) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      endIndex = left;
    }

    // If the range is invalid (start > end), return empty array
    if (startIndex >= endIndex) {
      return [];
    }

    return this.documents.slice(startIndex, endIndex);
  }
}
