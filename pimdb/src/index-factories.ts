import { BaseDocument } from "./pimdb";
import {
  PrimaryIndexFactory,
  SortedIndexFactory,
  SubstringIndexFactory,
} from "./collection-builder";

/**
 * Factory function to create a primary index factory
 */
export function primary<T extends BaseDocument>(): PrimaryIndexFactory<T> {
  return new PrimaryIndexFactory<T>();
}

/**
 * Factory function to create a sorted index factory on a specific field
 */
export function sorted<T extends BaseDocument>(
  field: keyof T,
): SortedIndexFactory<T> {
  return new SortedIndexFactory<T>(field);
}

/**
 * Factory function to create a substring index factory on a string field
 */
export function substring<T extends BaseDocument>(
  field: {
    [K in keyof T]: T[K] extends string ? K : never;
  }[keyof T],
): SubstringIndexFactory<T> {
  return new SubstringIndexFactory<T>(field);
}
