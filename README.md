# PimDB

A lightweight and Persistent In-Memory Database written in TypeScript.

## Features

- 🚀 Lightweight and fast
- 📦 Zero dependencies
- 💪 TypeScript support
- 🔒 Type-safe operations
- 🛠️ Simple API
- 🔍 Pluggable indexes

## Installation

```bash
# Using bun
bun add pimdb

# Using pnpm
pnpm add pimdb

# Using npm
npm install pimdb

# Using yarn
yarn add pimdb
```

## Quick start

```typescript
import { PimDB } from "pimdb";

// Initialize the database
const db = new PimDB();

// Store data
await db.set("users", { id: 1, name: "John" });

// Retrieve data
const user = await db.get("users");
```

## Example usage

```typescript
// db.ts

interface User {
  id: string;
  name: string;
  age: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  isPublished?: boolean;
}

// Define indexes
const userIndexes = {
  primary: new PimPrimaryIndex<User>(),
  byName: new PimSortedIndex<User>("name"),
  nameSearch: new PimSubstringIndex<User>("name"),
};

const postIndexes = {
  primary: new PimPrimaryIndex<Post>(),
  byTitle: new PimSortedIndex<Post>("title"),
  titleSearch: new PimSubstringIndex<Post>("title"),
};

// Create collection
export const db = createPimDB({
  users: new PimCollection<User, typeof userIndexes>(userIndexes),
  posts: new PimCollection<Post, typeof postIndexes>(postIndexes),
});
```

```typescript
import { db } from "./db";

// Insert data
db.users.insert({
  id: "1",
  name: "Alice",
  age: 30,
});

db.posts.insert({
  id: "1",
  title: "Hello, world!",
  content: "Welcome to the universe.",
  isPublished: true,
});

// All read operations are performed directly on the indexes
const user = db.users.indexes.primary.get("1");
const aliceUsers = db.users.indexes.byName.find("Alice");
const searchResults = db.users.indexes.nameSearch.search("li");
const thirtyPlus = db.users.indexes.byAge.findInRange({ gte: 30 });
```

## Indexes

PimDB comes with three index types to optimize your data queries.

### Primary index

```typescript
const primaryIndex = new PimPrimaryIndex<User>();
```

- Unique index, mandatory for each collection
- Supports retrieving single documents or all documents in the collection
- Provides O(1) performance for lookups by document ID

### Sorted index

```typescript
const sortedIndex = new PimSortedIndex<User>("name");
```

- Enables efficient exact matches and range queries (case-sensitive)
- Maintains documents sorted by a specified field, with document ID as a tie-breaker for consistent result ordering
- Provides O(log n) performance for lookups

### Substring index

```typescript
const substringIndex = new PimSubstringIndex<User>("name");
```

- Optimized for real-time search and partial text matching
- Supports case-insensitive substring searches within text fields
- Provides O(1) performance for partial matches

### Trigram index

- Coming soon.

### Custom index

Create your own indexes by implementing the `PimIndex` interface.

```typescript
interface PimIndex<T> {
  insert(item: T): boolean;
  update(item: T): boolean;
  delete(item: T): boolean;
}

export class MyIndex<T extends BaseDocument> implements PimIndex<T> {
  /**
   * Insert a document into the index.
   *
   * Returns true if the document was updated, false if it was not found.
   */
  insert(doc: T): boolean {
    // Implement me
    return false;
  }

  /**
   * Update a document in the index.
   *
   * Returns true if the document was updated, false if it was not found.
   */
  update(doc: T): boolean {
    // Implement me
    return false;
  }

  /**
   * Delete a document from the index.
   *
   * Returns true if the document was deleted, false if it was not found.
   */
  delete(doc: T): boolean {
    // Implement me
    return false;
  }

  /**
   * Implement your query methods here.
   */
  myQuery(id: T["id"]): T | undefined {
    // Implement me
    return undefined;
  }
}
```

<!--
## API reference

### factory createPimDB

TBD

### class PimDB

TBD

### class PimCollection

TBD

### interface PimIndex

TBD

### class PimPrimaryIndex

TBD

### class PimSortedIndex

TBD

### class PimSubstringIndex

TBD
-->

## Contributing

Contributions are welcome! Please feel free to [submit a Pull Request](https://github.com/lirbank/pimdb/pulls).

1. [Fork the repository](https://github.com/lirbank/pimdb/fork)
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. [Open a Pull Request](https://github.com/lirbank/pimdb/compare)

## License

This project is [open-source](https://github.com/lirbank/pimdb) and available under the [MIT License](LICENSE). Feel free to use it in your projects!

Authored and maintained by [Mikael Lirbank](https://github.com/lirbank).

If you find this project helpful, consider giving it a ⭐️ on [GitHub](https://github.com/lirbank/pimdb)!

## Consulting & commercial support

Need professional help? I'm available for consulting. Visit [lirbank.com](https://www.lirbank.com/) for more information and contact details.
