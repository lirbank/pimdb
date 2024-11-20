# PimDB

A lightweight **Persistent In-Memory Database** written in TypeScript.

⚠️ **Alpha notice:** PimDB is in an early stage of development. Persistence is not yet available, and features as well as the API are subject to change. Use with caution in experimental or non-critical projects.

PimDB is designed for browser-based applications but can also be used on the server. Its core features are actively being developed to deliver a lightweight and fast in-memory database for the browser.

## Features

- 🚀 Lightweight and fast
- 📦 Zero dependencies
- 💪 TypeScript support
- 🔒 Type-safe operations
- 🛠️ Simple API
- 🔍 Pluggable indexes
- 🔄 _Reactivity (React hook coming soon)_

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

import {
  createPimDB,
  PimCollection,
  PimPrimaryIndex,
  PimSortedIndex,
  PimSubstringIndex,
} from "pimdb";

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

// Define user indexes
const userIndexes = {
  primary: new PimPrimaryIndex<User>(),
  byName: new PimSortedIndex<User>("name"),
  nameSearch: new PimSubstringIndex<User>("name"),
};

// Define post indexes
const postIndexes = {
  primary: new PimPrimaryIndex<Post>(),
  byTitle: new PimSortedIndex<Post>("title"),
  titleSearch: new PimSubstringIndex<Post>("title"),
};

// Create and export database with collections
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

## Benchmarks

Initial benchmarks were conducted on a MacBook Pro M1 Max with 64 GB RAM.

### Sorted index

Setup: [100,000 documents](src/indexes/benchmarks/benchmark-data-100000.json) with a `name` field.

| Name           | Hz           | Min    | Max    | Mean   | P75    | P99    | P995   | P999   | RME    | Samples   | Notes   |
| -------------- | ------------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | --------- | ------- |
| `array.filter` | 1,055.57     | 0.8226 | 2.5986 | 0.9474 | 0.9021 | 1.9051 | 2.4339 | 2.5986 | ±2.22% | 529       |         |
| `index.find`   | 4,878,894.99 | 0.0001 | 0.2773 | 0.0002 | 0.0002 | 0.0002 | 0.0003 | 0.0004 | ±0.55% | 2,439,448 | Fastest |

Summary: **4622.03x faster** than native [Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

### Substring index

Setup: [100,000 documents](src/indexes/benchmarks/benchmark-data-100000.json) with a `title` field.

| Name           | Hz        | Min    | Max     | Mean   | P75    | P99     | P995    | P999    | RME    | Samples | Notes   |
| -------------- | --------- | ------ | ------- | ------ | ------ | ------- | ------- | ------- | ------ | ------- | ------- |
| `array.filter` | 132.14    | 5.5725 | 13.7257 | 7.5679 | 7.8342 | 13.7257 | 13.7257 | 13.7257 | ±4.31% | 67      |         |
| `index.search` | 96,649.82 | 0.0070 | 1.2095  | 0.0103 | 0.0073 | 0.0104  | 0.4675  | 0.5119  | ±3.50% | 48,325  | Fastest |

Summary: **731.44xx faster** than native [Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

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
