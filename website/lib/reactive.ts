import { BaseDocument, PimIndex, PimCollection } from "pimdb";

type Listener = () => void;

class ReactiveStore<
  T extends BaseDocument,
  TIndexes extends Record<string, PimIndex<T>>,
> {
  private collection: PimCollection<T, TIndexes>;
  private listeners: Map<string, Set<Listener>>;

  constructor(collection: PimCollection<T, TIndexes>) {
    this.collection = collection;
    this.listeners = new Map();
  }

  // Subscribe to a specific document or key
  subscribe(key: string, listener: Listener): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);
  }

  // Unsubscribe from a specific document or key
  unsubscribe(key: string, listener: Listener): void {
    this.listeners.get(key)?.delete(listener);
    if (this.listeners.get(key)?.size === 0) {
      this.listeners.delete(key);
    }
  }

  // Notify all listeners for a specific document or key
  private notify(key: string): void {
    this.listeners.get(key)?.forEach((listener) => listener());
  }

  // Wrap the PimCollection methods
  insert(doc: T): boolean {
    const result = this.collection.insert(doc);
    if (result) {
      this.notify(doc.id);
    }
    return result;
  }

  update(doc: T): boolean {
    const result = this.collection.update(doc);
    if (result) {
      this.notify(doc.id);
    }
    return result;
  }

  delete(doc: T): boolean {
    const result = this.collection.delete(doc);
    if (result) {
      this.notify(doc.id);
    }
    return result;
  }

  // Access raw data for read-only operations
  get(docId: string): T | undefined {
    return this.collection.primary.get(docId);
  }
}
