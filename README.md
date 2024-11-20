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

## API reference

### `PimDB`

#### `set(key: string, value: any): Promise<void>`

Store data in the database.

#### `get(key: string): Promise<any>`

Retrieve data from the database.

[Add other main methods here...]

## Examples

```typescript
// More detailed usage examples
const db = new PimDB();

// Store multiple items
await db.set("users", [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
]);

// Retrieve data
const users = await db.get("users");
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Indexes

PimDB comes with three powerful index types to optimize your data queries:

### Primary index

```typescript
const primaryIndex = new PimPrimaryIndex<User>();
```

- Required for each collection
- Provides O(1) lookups by document ID
- Ensures unique document IDs
- Supports `get()` and `all()` operations

### Sorted index

```typescript
const nameIndex = new PimSortedIndex<User>("name");
```

- Maintains documents in sorted order by the specified field
- Enables efficient range queries with `findInRange()`
- Supports exact matches with `find()`
- Secondary sorting by ID for documents with identical values
- O(log n) lookup complexity

### Substring index

```typescript
const nameSearchIndex = new PimSubstringIndex<User>("name");
```

- Enables fast substring searches on text fields
- Case-insensitive matching
- O(1) lookup time for exact substring matches
- Perfect for implementing search features
- Supports partial text matching anywhere in the field

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

## Example usage

```typescript
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
const db = createPimDB({
  users: new PimCollection<User, typeof userIndexes>(userIndexes),
  posts: new PimCollection<Post, typeof postIndexes>(postIndexes),
});

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

// Query examples - all reads are directly on indexes
const user = db.users.indexes.primary.get("1");
const aliceUsers = db.users.indexes.byName.find("Alice");
const searchResults = db.users.indexes.nameSearch.search("li");
const thirtyPlus = db.users.indexes.byAge.findInRange({ gte: 30 });
```

## License

This project is [open-source](https://github.com/lirbank/pimdb) and available under the [MIT License](LICENSE). Feel free to use it in your projects!

Authored and maintained by [Mikael Lirbank](https://github.com/lirbank).

If you find this project helpful, consider giving it a ⭐️ on [GitHub](https://github.com/lirbank/pimdb)!

## Consulting & commercial support

Need professional help? I'm available for consulting. Visit [lirbank.com](https://www.lirbank.com/) for more information and contact details.
