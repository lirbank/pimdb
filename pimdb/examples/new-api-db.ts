import { createPimDB, buildCollection, primary, sorted, substring } from "../src";

interface User {
  id: string;
  name: string;
  username: string;
  age: number;
}

interface Post {
  id: string;
  title: string;
}

export const db = createPimDB({
  users: buildCollection<User>()
    .add("primary", primary())
    .add("byName", sorted("name"))
    .add("nameSub", substring("name"))
    .add("userSub", substring("username"))
    .done(),

  posts: buildCollection<Post>()
    .add("primary", primary())
    .add("byTitle", sorted("title"))
    .add("titleSub", substring("title"))
    .done(),
});