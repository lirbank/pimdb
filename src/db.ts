import { createPimDB, PimCollection } from "./pimdb";
import { PimTextIndex } from "./indexes/text";
import { PimSortedIndex } from "./indexes/sorted";
import { PimPrimaryIndex } from "./indexes/primary";

// Define User and Post interfaces
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
  textIndexName: new PimTextIndex<User>("name"),
  textIndexUsername: new PimTextIndex<User>("username"),
};

const postsIdx = {
  primary: new PimPrimaryIndex<Post>(),
  regularIndex: new PimSortedIndex<Post>("title"),
  textIndex: new PimTextIndex<Post>("title"),
};

export const db = createPimDB({
  users: new PimCollection<User, typeof usersIdx>(usersIdx),
  posts: new PimCollection<Post, typeof postsIdx>(postsIdx),
});
