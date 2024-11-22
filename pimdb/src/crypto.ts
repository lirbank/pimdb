const alphanumeric = [
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789",
].join("");

function randomId(length: number): string {
  const result: string[] = [];
  const charactersLength = alphanumeric.length;
  const maxValidByte = 256 - (256 % charactersLength);

  while (result.length < length) {
    const randomBytes = new Uint8Array(length - result.length);
    crypto.getRandomValues(randomBytes);

    for (const randomByte of randomBytes) {
      if (randomByte < maxValidByte) {
        const index = randomByte % charactersLength;
        result.push(alphanumeric.charAt(index));

        if (result.length === length) {
          // Exit the loop if we've reached the desired length
          break;
        }
      }
      // Bytes equal to or above maxValidByte are discarded to avoid modulo bias
    }
  }

  return result.join("");
}

export function makeRandomId(length: number): () => string {
  return () => randomId(length);
}
