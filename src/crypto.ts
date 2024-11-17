const alphanumeric = [
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789",
].join("");

function randomId(length: number): string {
  const result = [];
  const charactersLength = alphanumeric.length;
  const maxValidByte = 256 - (256 % charactersLength);

  let generated = 0;
  while (generated < length) {
    const randomBytes = new Uint8Array(length - generated);
    crypto.getRandomValues(randomBytes);

    for (let i = 0; i < randomBytes.length && generated < length; i++) {
      const randomByte = randomBytes[i];

      if (randomByte < maxValidByte) {
        const index = randomByte % charactersLength;
        result.push(alphanumeric.charAt(index));
        generated++;
      }
      // Bytes equal to or above maxValidByte are discarded to avoid modulo bias
    }
  }

  return result.join("");
}
// function randomId(length: number): string {
//   const bytes = new Uint8Array(length);
//   crypto.getRandomValues(bytes);

//   return Array.from(bytes)
//     .map((byte) => alphanumeric[byte % alphanumeric.length])
//     .join("");
// }

/**
 * Make a cryptographically secure random id function
 *
 * @param length - The length of the id
 * @returns A cryptographically secure random string of the specified length
 */
export function makeRandomId(length: number = 24): string {
  return randomId(length);
}

// function makeRandomIdX(length = 24): string {
//   return Array.from(crypto.getRandomValues(new Uint8Array(length)))
//     .map((byte) => alphanumeric.charAt(byte % alphanumeric.length))
//     .join("");
// }
