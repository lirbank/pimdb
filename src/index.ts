import { PimCollection, PimRangeIndex, PimSecondaryIndex } from "./pimdb";

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const nameIndex = new PimSecondaryIndex<User>("nameIndex", ["name"]);
const ageRangeIndex = new PimRangeIndex<User>("ageRangeIndex", "age");

const indexes = {
  nameIndex: nameIndex,
  ageRangeIndex: ageRangeIndex,
};

const users = new PimCollection<number, User, typeof indexes>(
  "users",
  "id",
  indexes,
);

users.insert({ id: 1, name: "Alice", email: "alice@example.com", age: 30 });
users.insert({ id: 2, name: "Bob", email: "bob@example.com", age: 25 });
users.insert({ id: 3, name: "Charlie", email: "charlie@example.com", age: 35 });

const alice = users.getByPrimaryKey(1);
console.log("Get by primary key (id = 1):", alice);

// Access the name index
const usersNamedAlice = users.indexes.nameIndex.query({ name: "Alice" });
console.log("Users named Alice:", usersNamedAlice);

// Access the age range index
const usersInThirties = users.indexes.ageRangeIndex.rangeQuery(30, 39);
console.log("Users in their thirties:", usersInThirties);

// Update Alice's age
users.update({ id: 1, name: "Alice", email: "alice@example.com", age: 31 });

// Verify the update
const updatedAlice = users.getByPrimaryKey(1);
console.log("Updated Alice:", updatedAlice);

// Verify that indexes are updated
const usersInThirtiesAfterUpdate = users.indexes.ageRangeIndex.rangeQuery(
  30,
  39,
);
console.log(
  "Users in their thirties after update:",
  usersInThirtiesAfterUpdate,
);

// Delete Bob
users.delete(2);

// Verify deletion
const bob = users.getByPrimaryKey(2);
console.log("Bob after deletion:", bob); // Should be undefined

// Verify that indexes are updated
const usersInTwentiesAfterDeletion = users.indexes.ageRangeIndex.rangeQuery(
  20,
  29,
);
console.log(
  "Users in their twenties after deletion:",
  usersInTwentiesAfterDeletion,
);

const allUsers = users.getAllRecords();
console.log("All users:", allUsers);
