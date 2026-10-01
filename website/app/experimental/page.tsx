"use client";

import { db } from "@/lib/db";
import { BaseDocument } from "pimdb";
import { PimSubstringIndex } from "pimdb";
import { useEffect, useState } from "react";

// import { useState, useEffect } from "react";

// export function useReactiveSubstringQuery<T extends BaseDocument>(
//   index: PimSubstringIndex<T>,
//   query: string
// ): T[] {
//   const [result, setResult] = useState(() => index.search(query));

//   useEffect(() => {
//     const update = () => setResult(index.search(query));
//     index.subscribe(query, update);
//     return () => index.unsubscribe(query, update);
//   }, [index, query]);

//   return result;
// }

// Fixtures
db.users.insert({
  id: "1",
  name: "Alice",
  age: 30,
  username: "alice",
});
db.users.insert({
  id: "2",
  name: "Bob",
  username: "bob",
  age: 25,
});
db.users.insert({
  id: "3",
  name: "Charlie",
  age: 35,
  username: "charlie",
});

function Row(props: { id: string; user: string }) {
  console.log("Render", props.id, props.user);

  return <div>{props.user}</div>;
}

export default function Home() {
  const [users, setUsers] = useState<{ id: string; user: string }[]>([
    { id: "0", user: "Alice" },
    { id: "1", user: "Bob" },
    { id: "2", user: "Charlie" },
    { id: "3", user: "Dave" },
    { id: "4", user: "Eve" },
    { id: "5", user: "Frank" },
    { id: "6", user: "Grace" },
    { id: "7", user: "Hank" },
    { id: "8", user: "Ivy" },
    { id: "9", user: "Jack" },
  ]);

  const alice = db.users.indexes.primary.get("1");
  console.log("Get by primary key (id = 1):", alice);

  // Access the name index
  const usersNamedAlice = db.users.indexes.regularIndex.find("Alice");
  console.log("Users named Alice:", usersNamedAlice);

  // Access the age range index
  const usersInThirties = db.users.indexes.regularIndex.findInRange({
    gte: 30,
    lte: 39,
  });
  console.log("Users in their thirties:", usersInThirties);

  // Verify the update
  const updatedAlice = db.users.indexes.primary.get("1");
  console.log("Updated Alice:", updatedAlice);

  // Verify that indexes are updated
  const usersInThirtiesAfterUpdate = db.users.indexes.regularIndex.findInRange({
    gte: 30,
    lte: 39,
  });
  console.log(
    "Users in their thirties after update:",
    usersInThirtiesAfterUpdate
  );

  // Delete Bob
  db.users.delete({ id: "2", name: "Bob", username: "bob", age: 25 });

  // Verify deletion
  const bob = db.users.indexes.primary.get("2");
  console.log("Bob after deletion:", bob); // Should be undefined

  // Verify that indexes are updated
  const usersInTwentiesAfterDeletion =
    db.users.indexes.regularIndex.findInRange({
      gte: 20,
      lte: 29,
    });
  console.log(
    "Users in their twenties after deletion:",
    usersInTwentiesAfterDeletion
  );

  const allUsers = db.users.indexes.primary.all();
  console.log("All users:", allUsers);

  return (
    <div className="flex flex-col gap-4">
      <div>
        {users.map((user) => (
          <div key={user.id}>
            <Row id={user.id} user={user.user} />
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={() => {
                setUsers(
                  users.map((u) =>
                    u.id === user.id ? { ...u, user: "New Name" } : u
                  )
                );
              }}
            >
              Change name
            </button>
          </div>
        ))}
      </div>

      <div>
        <button
          className="bg-cyan-500 text-white px-2 py-1 rounded"
          onClick={() => {
            // Update Alice's age
            db.users.update({
              id: "1",
              name: "Alice",
              // email: "alice@example.com",
              age: 31,
              username: "alice",
            });
          }}
        >
          Set Alice's age to 31
        </button>
      </div>
      <div>
        <div className="font-bold">Users named Alice:</div>
        {usersNamedAlice.map((user) => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    </div>
  );
}
