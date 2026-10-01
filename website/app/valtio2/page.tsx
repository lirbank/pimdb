"use client";

import { db, User } from "@/lib/db";
import { PimSubstringIndex } from "pimdb";
import { BaseDocument } from "pimdb";
import { useState, useMemo } from "react";
import { proxy, useSnapshot } from "valtio";

export class ReactivePimSubstringIndex<
  T extends BaseDocument,
> extends PimSubstringIndex<T> {
  state = proxy({
    substringMap: this.substringMap,
    map: this.map,
  });

  override insert(doc: T): boolean {
    const result = super.insert(doc);
    if (result) {
      // Trigger reactivity manually if needed
      this.state.substringMap = this.substringMap;
    }
    return result;
  }

  override delete(doc: T): boolean {
    const result = super.delete(doc);
    if (result) {
      this.state.substringMap = this.substringMap;
    }
    return result;
  }

  override update(doc: T): boolean {
    const result = super.update(doc);
    if (result) {
      this.state.substringMap = this.substringMap;
    }
    return result;
  }
}

export function useReactiveSubstringQuery<T extends BaseDocument>(
  index: ReactivePimSubstringIndex<T>,
  query: string
): T[] {
  const snapshot = useSnapshot(index.state);

  // Ensure we return an array
  const matchingSet = snapshot.substringMap.get(query.toLowerCase());
  return matchingSet ? Array.from(matchingSet) : [];
}

function UserSearch({ index }: { index: ReactivePimSubstringIndex<User> }) {
  const [query, setQuery] = useState("");
  const users = useReactiveSubstringQuery(index, "al");

  return (
    <div>
      <button
        onClick={() => {
          index.insert({
            id: "5",
            name: "Alice 3",
            username: "alice3",
            age: 50,
          });
        }}
      >
        Add user
      </button>
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

export default function Home() {
  const index = useMemo(() => {
    const idx = new ReactivePimSubstringIndex<User>("name");

    // Insert initial data
    idx.insert({ id: "1", name: "Alice", username: "alice", age: 30 });
    idx.insert({ id: "2", name: "Bob", username: "bob", age: 25 });
    idx.insert({ id: "3", name: "Charlie", username: "charlie", age: 35 });
    idx.insert({ id: "4", name: "Alice 2", username: "alice2", age: 40 });

    return idx;
  }, []);

  return <UserSearch index={index} />;
}
