import { BaseDocument, PimIndex, PimCollection } from "./pimdb";
import { PimPrimaryIndex } from "./indexes/primary";
import { PimSortedIndex } from "./indexes/sorted";
import { PimSubstringIndex } from "./indexes/substring";

/**
 * Index factory interface that creates an index for a specific document type
 */
export interface IndexFactory<T extends BaseDocument> {
  create(): PimIndex<T>;
}

/**
 * Primary index factory
 */
export class PrimaryIndexFactory<T extends BaseDocument>
  implements IndexFactory<T>
{
  create(): PimPrimaryIndex<T> {
    return new PimPrimaryIndex<T>();
  }
}

/**
 * Sorted index factory
 */
export class SortedIndexFactory<T extends BaseDocument>
  implements IndexFactory<T>
{
  constructor(private field: keyof T) {}

  create(): PimSortedIndex<T> {
    return new PimSortedIndex<T>(this.field);
  }
}

/**
 * Substring index factory
 */
export class SubstringIndexFactory<T extends BaseDocument>
  implements IndexFactory<T>
{
  constructor(
    private field: {
      [K in keyof T]: T[K] extends string ? K : never;
    }[keyof T],
  ) {}

  create(): PimSubstringIndex<T> {
    return new PimSubstringIndex<T>(this.field);
  }
}

/**
 * Collection builder that provides a fluent API for building collections with named indexes
 */
export class CollectionBuilder<
  T extends BaseDocument,
  TIndexes extends Record<string, PimIndex<T>> = {},
> {
  private indexFactories: Record<string, IndexFactory<T>>;

  constructor(indexFactories: Record<string, IndexFactory<T>> = {}) {
    this.indexFactories = indexFactories;
  }

  /**
   * Add a named index to the collection using a factory
   */
  add<Name extends string>(
    name: Name,
    factory: IndexFactory<T>,
  ): CollectionBuilder<T, TIndexes & Record<Name, PimIndex<T>>> {
    const newFactories = { ...this.indexFactories, [name]: factory };
    return new CollectionBuilder<T, TIndexes & Record<Name, PimIndex<T>>>(
      newFactories,
    );
  }

  /**
   * Complete the builder and return a PimCollection
   */
  done(): PimCollection<T, TIndexes> {
    const indexes = {} as TIndexes;
    for (const [name, factory] of Object.entries(this.indexFactories)) {
      (indexes as any)[name] = factory.create();
    }
    return new PimCollection<T, TIndexes>(indexes);
  }
}

/**
 * Factory function to create a new collection builder
 */
export function buildCollection<T extends BaseDocument>(): CollectionBuilder<
  T,
  {}
> {
  return new CollectionBuilder<T, {}>();
}
