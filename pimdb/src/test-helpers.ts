export interface Spaceship {
  id: string;
  name: string;
}

export const makeSubstringPredicate =
  (indexField: keyof Spaceship) => (query: string) => {
    const queryLower = query.toLowerCase();
    return (doc: Spaceship) =>
      doc[indexField].toLowerCase().includes(queryLower);
  };

export const makeExactMatchPredicate =
  (indexField: keyof Spaceship) => (query: string) => (doc: Spaceship) =>
    doc[indexField] === query;

export function getMiddleDoc(arr: Spaceship[]) {
  return arr[Math.floor(arr.length / 2)]!;
}