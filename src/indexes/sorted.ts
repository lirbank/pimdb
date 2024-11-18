import { BaseDocument, Index } from "../pimdb";

/**
 * Sorted Index
 *
 * Write operations work with document references, mutating the documents in
 * place, allowing documents to be shared across multiple indexes.
 *
 * Read operations return a new array containing references (not clones) to the
 * indexed documents.
 */
export class PimSortedIndex<T extends BaseDocument> implements Index<T> {
  private indexKey: keyof T;
  private documents: T[] = [];

  constructor(indexKey: keyof T) {
    this.indexKey = indexKey;
  }

  insert(doc: T): void {
    const value = doc[this.indexKey];
    let left = 0;
    let right = this.documents.length - 1;

    // Find insertion point using binary search
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midDoc = this.documents[mid];

      // Add null checks
      if (!midDoc) {
        throw new Error(`Invalid document at index ${mid}`);
      }

      const midValue = midDoc[this.indexKey];

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
  }

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
    const oldValue = existingDoc[this.indexKey];
    const newValue = doc[this.indexKey];

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

  delete(doc: T): boolean {
    // Find and remove the existing document with matching id
    const existingIndex = this.documents.findIndex((d) => d.id === doc.id);
    if (existingIndex === -1) {
      return false;
    }

    this.documents.splice(existingIndex, 1);
    return true;
  }

  find(value?: T[typeof this.indexKey]): T[] {
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

      const midValue = midDoc[this.indexKey];

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
      if (doc[this.indexKey] !== value) break;
      results.push(doc);
      i++;
    }

    return results;
  }

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

        const midValue = midDoc[this.indexKey];

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

        const midValue = midDoc[this.indexKey];

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
