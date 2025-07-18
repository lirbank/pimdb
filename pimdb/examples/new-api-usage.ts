import { db } from "./new-api-db";

// 1) Inserts
db.users.insert({ id: "1", name: "Alice", username: "alice", age: 30 });
db.users.insert({ id: "2", name: "Bob", username: "bob", age: 25 });

// 2) Primary lookup
const alice = db.users.get("1");
console.log("get by id:", alice);

// 3) Sorted‐index lookup
const alices = db.users
  .getIndex("byName")
  .find("Alice"); // → User[]
console.log("find by name:", alices);

// 4) Substring search
const matches = db.users
  .getIndex("nameSub")
  .search("ali"); // → User[]
console.log("substring search:", matches);

// 5) Range queries (on the sorted index)
const midLifers = db.users
  .getIndex("byName")
  .findInRange({ gte: "A", lte: "M" });
console.log("A–M range:", midLifers);

// 6) Updates & deletes
db.users.update({ id: "1", name: "Alicia", username: "alice", age: 31 });
db.users.delete("2");

// 7) Strong typing
// db.users.getIndex("foo")   // TS error: '"foo"' not in '"primary"|"byName"|"nameSub"|"userSub"'