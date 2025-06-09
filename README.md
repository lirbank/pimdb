# PimDB

A lightweight **Persisted In-Memory Database** written in TypeScript.

⚠️ **Alpha notice:** PimDB is in an early stage of development. Persistence is not yet available, and features as well as the API are subject to change. Use with caution in experimental or non-critical projects.

A lightweight, persisted in-memory database built from the ground up for the browser. PimDB delivers fast and efficient text indexing with substring, n-gram, and sorted indexes, enabling quick lookups for both partial and exact matches. On a dataset of 100,000 documents, it's currently **4,000x+ faster** than `Array.filter` for sorted lookups and **700x+ faster** for substring searches.

## Features

- 🚀 Lightweight and fast
- 📦 Zero dependencies
- 💪 TypeScript support
- 🔒 Type-safe operations
- 🛠️ Simple API
- 🔍 Pluggable indexes
- 🔄 _Reactivity (React hook coming soon)_

## Installation

PimDB is published on [npmjs.com](https://www.npmjs.com/package/pimdb).

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

### 1. Setting up the database

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

### 2. Using the database

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

### Sorted index - Chromium

Setup: [100,000 documents](pimdb/src/indexes/benchmarks/benchmark-data.json) with a `name` field.

| Name           | Hz           | Min    | Max    | Mean   | P75    | P99    | P995   | P999   | RME    | Samples |
| -------------- | ------------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------- |
| `array.filter` | 1,593.88     | 0.5000 | 1.1000 | 0.6274 | 0.7000 | 0.9000 | 1.0000 | 1.1000 | ±0.86% | 1000    |
| `sorted.find`  | 3,482,412.00 | 0.0000 | 3.8000 | 0.0003 | 0.0000 | 0.0000 | 0.0000 | 0.1000 | ±3.13% | 1741206 |

Summary: **2184.87x faster** than native [Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

### Substring index - Chromium

Setup: [100,000 documents](pimdb/src/indexes/benchmarks/benchmark-data.json) with a `title` field.

| Name               | Hz         | Min    | Max    | Mean   | P75    | P99    | P995   | P999   | RME    | Samples | Notes   |
| ------------------ | ---------- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------- | ------- |
| `array.filter`     | 183.81     | 4.8000 | 7.2000 | 5.4404 | 5.6000 | 6.5000 | 6.8000 | 7.0000 | ±0.43% | 1000    |         |
| `substring.search` | 151,486.00 | 0.0000 | 0.3000 | 0.0066 | 0.0000 | 0.1000 | 0.1000 | 0.1000 | ±2.72% | 75743   | Fastest |

Summary: **824.14x faster** than native [Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

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

Contributions are welcome! Please open issues or pull requests on [GitHub](https://github.com/lirbank/pimdb/pulls).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Need expert help?

I take on a few consulting projects each year where I can build, unblock, and ship.

**[STΛR MODΞ](https://www.starmode.dev/)** — The AI development studio I run with AI/ML expert and data scientist Spencer Smith. We help companies build accurate AI solutions: AI-first apps, advanced workflows, and agentic systems.

**[Mikael Lirbank](https://www.lirbank.com/)** — My solo practice, focused on web app development, test automation, code quality, and technical architecture. I'm around, friendly, and happy to help with the hard stuff.
