export interface Spaceship {
  id: string;
  name: string;
}

export const makePredicate =
  (indexField: keyof Spaceship) => (query: string) => (doc: Spaceship) =>
    doc[indexField].toLowerCase().includes(query.toLowerCase());

export function getMiddleDoc(arr: Spaceship[]) {
  return arr[Math.floor(arr.length / 2)]!;
}
