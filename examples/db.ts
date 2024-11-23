import {
  createPimDB,
  PimCollection,
  PimSubstringIndex,
  PimSortedIndex,
  PimPrimaryIndex,
} from "pimdb";

interface User {
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

export const db = createPimDB({
  users: new PimCollection<User, typeof usersIdx>(usersIdx),
  posts: new PimCollection<Post, typeof postsIdx>(postsIdx),
});
