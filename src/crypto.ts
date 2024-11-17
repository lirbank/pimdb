const BASE62_CHARS = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`;

/**
 * Generates a cryptographically secure random string of specified length using base62 characters
 * @param length The desired length of the random string
 * @returns A random string of the specified length
 */
export function generateRandomBase62(length: number): string {
  // Create a Uint8Array with enough bytes
  const bytes = new Uint8Array(length);
  // Fill it with cryptographically secure random values
  crypto.getRandomValues(bytes);

  let result = "";
  for (let i = 0; i < length; i++) {
    // Map the byte to our character set (62 characters)
    result += BASE62_CHARS[bytes[i] % BASE62_CHARS.length];
  }

  return result;
}
