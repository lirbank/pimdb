import { db } from "./db";

db.users.insert({
  id: "1",
  name: "Alice",
  // email: "alice@example.com",
  age: 30,
  username: "alice",
});
db.users.insert({ id: "2", name: "Bob", username: "bob", age: 25 });
db.users.insert({
  id: "3",
  name: "Charlie",
  // email: "charlie@example.com",
  age: 35,
  username: "charlie",
});

const alice = db.users.indexes.primary.get("1");
console.log("Get by primary key (id = 1):", alice);

// Access the name index
const usersNamedAlice = db.users.indexes.regularIndex.find("Alice");
console.log("Users named Alice:", usersNamedAlice);

// Access the age range index
const usersInThirties = db.users.indexes.regularIndex.findInRange(30, 39);
console.log("Users in their thirties:", usersInThirties);

// Update Alice's age
db.users.update({
  id: "1",
  name: "Alice",
  // email: "alice@example.com",
  age: 31,
  username: "alice",
});

// Verify the update
const updatedAlice = db.users.indexes.primary.get("1");
console.log("Updated Alice:", updatedAlice);

// Verify that indexes are updated
const usersInThirtiesAfterUpdate = db.users.indexes.regularIndex.findInRange(
  30,
  39,
);
console.log(
  "Users in their thirties after update:",
  usersInThirtiesAfterUpdate,
);

// Delete Bob
db.users.delete({ id: "2", name: "Bob", username: "bob", age: 25 });

// Verify deletion
const bob = db.users.indexes.primary.get("2");
console.log("Bob after deletion:", bob); // Should be undefined

// Verify that indexes are updated
const usersInTwentiesAfterDeletion = db.users.indexes.regularIndex.findInRange(
  20,
  29,
);
console.log(
  "Users in their twenties after deletion:",
  usersInTwentiesAfterDeletion,
);

const allUsers = db.users.indexes.primary.getAll();
console.log("All users:", allUsers);
