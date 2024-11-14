interface Index<V> {
  insert(record: V): void;
  update(record: V): void;
  delete(record: V): void;
}

console.log("Hello World");
