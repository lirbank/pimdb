import {
  createPimDB,
  PimCollection,
  PimSubstringIndex,
  PimSortedIndex,
  PimPrimaryIndex,
} from "pimdb";

export interface User {
  id: string;
  name: string;
  username: string;
  age: number;
  enabled?: boolean;
}

interface Post {
  id: string;
  title: string;
}

type Status = "pending" | "completed";
type Todo = {
  id: string;
  description: string;
  status: Status;
};

const usersIdx = {
  primary: new PimPrimaryIndex<User>(),
  regularIndex: new PimSortedIndex<User>("name"),
  substringIndexName: new PimSubstringIndex<User>("name"),
  substringIndexUsername: new PimSubstringIndex<User>("username"),
};

const postsIdx = {
  primary: new PimPrimaryIndex<Post>(),
  regularIndex: new PimSortedIndex<Post>("title"),
  substringIndex: new PimSubstringIndex<Post>("title"),
};

const todosIdx = {
  primary: new PimPrimaryIndex<Todo>(),
  regularIndex: new PimSortedIndex<Todo>("description"),
  substringIndex: new PimSubstringIndex<Todo>("description"),
};

export const db = createPimDB({
  users: new PimCollection<User, typeof usersIdx>(usersIdx),
  posts: new PimCollection<Post, typeof postsIdx>(postsIdx),
  todos: new PimCollection<Todo, typeof todosIdx>(todosIdx),
});
