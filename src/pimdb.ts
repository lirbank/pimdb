/* eslint-disable @typescript-eslint/no-explicit-any */
interface Index<V extends Record<string, any>> {
  name: string;
  insert(record: V): void;
  update(record: V): void;
  delete(record: V): void;
}

/**
 * Primary index
 */
export class PimPrimaryIndex<K, V extends Record<string, any>>
  implements Index<V>
{
  name: string;
  private primaryKeyField: keyof V;
  private index: Map<K, V>;

  constructor(name: string, primaryKeyField: keyof V) {
    this.name = name;
    this.primaryKeyField = primaryKeyField;
    this.index = new Map<K, V>();
  }

  insert(record: V): void {
    const key = record[this.primaryKeyField] as K;
    if (this.index.has(key)) {
      throw new Error(`Duplicate primary key: ${key}`);
    }
    this.index.set(key, record);
  }

  update(record: V): void {
    const key = record[this.primaryKeyField] as K;
    if (!this.index.has(key)) {
      throw new Error(`Record with primary key ${key} does not exist`);
    }
    this.index.set(key, record);
  }

  delete(record: V): void {
    const key = record[this.primaryKeyField] as K;
    if (!this.index.delete(key)) {
      throw new Error(`Record with primary key ${key} does not exist`);
    }
  }

  get(key: K): V | undefined {
    return this.index.get(key);
  }

  getAll(): V[] {
    return Array.from(this.index.values());
  }
}

/**
 * Secondary index
 */
export class PimSecondaryIndex<V extends Record<string, any>>
  implements Index<V>
{
  name: string;
  private keyFields: (keyof V)[];
  private index: Map<string, V[]>;

  constructor(name: string, keyFields: (keyof V)[]) {
    this.name = name;
    this.keyFields = keyFields;
    this.index = new Map<string, V[]>();
  }

  private generateKey(record: V): string {
    return this.keyFields.map((field) => record[field]).join("|");
  }

  insert(record: V): void {
    const key = this.generateKey(record);
    if (!this.index.has(key)) {
      this.index.set(key, []);
    }
    this.index.get(key)!.push(record);
  }

  update(record: V): void {
    this.delete(record);
    this.insert(record);
  }

  delete(record: V): void {
    const key = this.generateKey(record);
    const records = this.index.get(key);
    if (records) {
      const idx = records.indexOf(record);
      if (idx !== -1) {
        records.splice(idx, 1);
        if (records.length === 0) {
          this.index.delete(key);
        }
      }
    }
  }

  query(criteria: Partial<V>): V[] {
    const key = this.keyFields.map((field) => criteria[field] || "").join("|");
    return this.index.get(key) || [];
  }
}

/**
 * Range index
 */
export class PimRangeIndex<V extends Record<string, any>> implements Index<V> {
  name: string;
  private keyField: keyof V;
  private index: Map<number, V[]>;

  constructor(name: string, keyField: keyof V) {
    this.name = name;
    this.keyField = keyField;
    this.index = new Map<number, V[]>();
  }

  insert(record: V): void {
    const key = record[this.keyField] as number;
    if (!this.index.has(key)) {
      this.index.set(key, []);
    }
    this.index.get(key)!.push(record);
  }

  update(record: V): void {
    this.delete(record);
    this.insert(record);
  }

  delete(record: V): void {
    const key = record[this.keyField] as number;
    const records = this.index.get(key);
    if (records) {
      const idx = records.indexOf(record);
      if (idx !== -1) {
        records.splice(idx, 1);
        if (records.length === 0) {
          this.index.delete(key);
        }
      }
    }
  }

  rangeQuery(min?: number, max?: number): V[] {
    let results: V[] = [];
    for (const [key, records] of this.index.entries()) {
      if (
        (min === undefined || key >= min) &&
        (max === undefined || key <= max)
      ) {
        results = results.concat(records);
      }
    }
    return results;
  }
}

/**
 * Collection
 */
export class PimCollection<
  K,
  V extends Record<string, any>,
  I extends { [key: string]: Index<V> },
> {
  name: string;
  primaryIndex: PimPrimaryIndex<K, V>;
  indexes: I;

  constructor(name: string, primaryKeyField: keyof V, indexes: I) {
    this.name = name;
    this.primaryIndex = new PimPrimaryIndex<K, V>(
      "primaryIndex",
      primaryKeyField,
    );
    this.indexes = indexes;
  }

  insert(record: V): void {
    this.primaryIndex.insert(record);
    for (const index of Object.values(this.indexes)) {
      index.insert(record);
    }
  }

  update(record: V): void {
    this.primaryIndex.update(record);
    for (const index of Object.values(this.indexes)) {
      index.update(record);
    }
  }

  delete(key: K): void {
    const record = this.primaryIndex.get(key);
    if (!record) {
      throw new Error(`Record with primary key ${key} does not exist`);
    }
    this.primaryIndex.delete(record);
    for (const index of Object.values(this.indexes)) {
      index.delete(record);
    }
  }

  getByPrimaryKey(key: K): V | undefined {
    return this.primaryIndex.get(key);
  }

  getAllRecords(): V[] {
    return this.primaryIndex.getAll();
  }
}
