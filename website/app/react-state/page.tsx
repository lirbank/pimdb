"use client";

import { db, User } from "@/lib/db";
import { PimSubstringIndex } from "pimdb";
import { BaseDocument } from "pimdb";
import { useState, memo, useEffect } from "react";

export function useReactiveSubstringQuery<T extends BaseDocument>(
  index: PimSubstringIndex<T>,
  query: string
): T[] {
  const [result, setResult] = useState(() => index.search(query));

  useEffect(() => {
    const update = () => setResult(index.search(query));
    index.subscribe(query, update);
    return () => index.unsubscribe(query, update);
  }, [index, query]);

  return result;
}

function Row(props: { id: string; user: string }) {
  console.log("Render", props.id, props.user);

  return <div>{props.user}</div>;
}

const MemoizedRow = memo(Row);

// const index = new PimSubstringIndex<User>("name");

function UserSearch({ index }: { index: PimSubstringIndex<User> }) {
  const [query, setQuery] = useState("");
  const users = useReactiveSubstringQuery(index, query);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users"
        className="border rounded px-2 py-1"
      />
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.username})
          </li>
        ))}
      </ul>
    </div>
  );
}

// export default function App() {
//   const index = new PimSubstringIndex<User>("name");

//   // Insert initial data
//   useEffect(() => {
//     index.insert({ id: "1", name: "Alice", username: "alice", age: 30 });
//     index.insert({ id: "2", name: "Bob", username: "bob", age: 25 });
//     index.insert({ id: "3", name: "Charlie", username: "charlie", age: 35 });
//   }, []);

//   return <UserSearch index={index} />;
// }

export default function Home() {
  const [query, setQuery] = useState("");

  const index = new PimSubstringIndex<User>("name");

  // Insert initial data
  useEffect(() => {
    index.insert({ id: "1", name: "Alice", username: "alice", age: 30 });
    index.insert({ id: "2", name: "Bob", username: "bob", age: 25 });
    index.insert({ id: "3", name: "Charlie", username: "charlie", age: 35 });
  }, []);

  const [users, setUsers] = useState<{ id: string; user: string }[]>([
    { id: "0", user: "Alice" },
    { id: "1", user: "Bob" },
    { id: "2", user: "Charlie" },
    { id: "3", user: "Dave" },
    { id: "4", user: "Eve" },
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <UserSearch index={index} />
      </div>
      <div className="grid gap-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-2">
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
            <MemoizedRow id={user.id} user={user.user} />
          </div>
        ))}
      </div>
    </div>
  );
}
