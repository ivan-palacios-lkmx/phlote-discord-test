/**
 * Generates a quick, non-cryptographic hexadecimal hash from a string.
 *
 * The hash is computed using bitwise operations in a simple manner and is
 * intended for applications like indexing, sharding, cache-busting, or quick lookups
 * where cryptographically secure hashes are not required.
 *
 * The output is always a positive hexadecimal string representation of the hash.
 *
 * @param {string} str - The input string to hash.
 * @returns {string} The generated hexadecimal hash string (non-cryptographic).
 */
export function quickHash(str: string): string {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Normalizes and validates slide items from raw slice data.
 * Filters out invalid items (non-objects, null values) and returns
 * a normalized array of slide objects.
 *
 * @param {unknown[] | undefined} rawItems - Raw items array from slice data.
 * @returns {T[]} Array of validated slide objects.
 */
export function normalizeSlideItems<T extends Record<string, unknown>>(
  rawItems: unknown[] | undefined,
): T[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .filter((item): item is T => item !== null && typeof item === "object")
    .map((item) => item as T);
}
