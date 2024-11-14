import {
  PimCollection,
  PimPrimaryIndex,
  PimRangeIndex,
  PimSecondaryIndex,
} from "./pimdb";

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Create a primary index on 'id'
const primaryIndex = new PimPrimaryIndex<number, User>("primaryIndex", "id");

// Create a secondary index on 'name'
const nameIndex = new PimSecondaryIndex<User>("nameIndex", ["name"]);

// Create a range index on 'age'
const ageRangeIndex = new PimRangeIndex<User>("ageRangeIndex", "age");

// Create a collection with the primary key field 'id' and the indexes
const users = new PimCollection<number, User>("users", "id", [
  nameIndex,
  ageRangeIndex,
]);

users.insert({ id: 1, name: "Alice", email: "alice@example.com", age: 30 });
users.insert({ id: 2, name: "Bob", email: "bob@example.com", age: 25 });
users.insert({ id: 3, name: "Charlie", email: "charlie@example.com", age: 35 });

const alice = users.getByPrimaryKey(1);
console.log("Get by primary key (id = 1):", alice);

// Access the 'nameIndex'
const nameIdx = users.getIndex<PimSecondaryIndex<User>>("nameIndex");
if (nameIdx) {
  const usersNamedAlice = nameIdx.query({ name: "Alice" });
  console.log("Users named Alice:", usersNamedAlice);
}

// Access the 'ageRangeIndex'
const ageIdx = users.getIndex<PimRangeIndex<User>>("ageRangeIndex");
if (ageIdx) {
  const usersInTwenties = ageIdx.rangeQuery(20, 29);
  console.log("Users in their twenties:", usersInTwenties);

  const usersInThirties = ageIdx.rangeQuery(30, 39);
  console.log("Users in their thirties:", usersInThirties);
}

// Update Alice's age
users.update({ id: 1, name: "Alice", email: "alice@example.com", age: 31 });

// Verify the update
const updatedAlice = users.getByPrimaryKey(1);
console.log("Updated Alice:", updatedAlice);

// Verify that the indexes are updated
if (ageIdx) {
  const usersInThirties = ageIdx.rangeQuery(30, 39);
  console.log("Users in their thirties after update:", usersInThirties);
}

// Delete Bob
users.delete(2);

// Verify deletion
const bob = users.getByPrimaryKey(2);
console.log("Bob after deletion:", bob); // Should be undefined

// Verify that Bob is removed from indexes
if (ageIdx) {
  const usersInTwenties = ageIdx.rangeQuery(20, 29);
  console.log("Users in their twenties after deletion:", usersInTwenties);
}

const allUsers = users.getAllRecords();
console.log("All users:", allUsers);

const indexNames = users.getIndexNames();
console.log("Index names:", indexNames);
