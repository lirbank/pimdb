import { PimCollection, PimIndex } from "pimdb";
import { useState, useEffect } from "react";
import { BaseDocument } from "pimdb";

export function usePimDB<
  T extends BaseDocument,
  TIndexes extends Record<string, PimIndex<T>> = {},
>(collection: PimCollection<T, TIndexes>, queryFn: () => T[]): T[] {
  const [data, setData] = useState<T[]>(() => queryFn());

  useEffect(() => {
    function handleChange() {
      setData(queryFn());
    }

    collection.addListener(handleChange);

    return () => {
      collection.removeListener(handleChange);
    };
  }, [collection, queryFn]);

  return data;
}
