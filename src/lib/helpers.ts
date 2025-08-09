import crypto from 'crypto';
import { JsonValue } from './types';

/**
 * Deeply sorts an object by keys alphabetically.
 * Also sorts arrays of objects by their stringified values (optional).
 *
 * @param obj - The object or array to deeply sort.
 * @returns A new object/array with keys sorted recursively.
 */
export function deepSort(obj: JsonValue): JsonValue {
  if (Array.isArray(obj)) {
    return obj.map(deepSort);
  } else if (obj !== null && typeof obj === 'object') {
    const sortedEntries = Object.entries(obj)
      .map(([k, v]) => [k, deepSort(v)] as const)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    return Object.fromEntries(sortedEntries);
  } else {
    return obj;
  }
}

/**
 * Stringify a JSON value with consistent ordering of object keys.
 *
 * @param obj - The JSON value to stringify.
 * @returns The stable stringified JSON.
 */
export function stableStringify(obj: JsonValue): string {
  const sorted = deepSort(obj);
  return JSON.stringify(sorted);
}

/**
 * Formats the current date as a string in YYYYMMDD format.
 *
 * @returns {string} Current date formatted as 'YYYYMMDD'.
 */
export const formatDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 0-indexed months, so +1
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * Creates a SHA-256 hash (hex) of the stable-stringified JSON data.
 *
 * @param data - The JSON value to hash.
 * @returns The hex-encoded SHA-256 hash string.
 */
export const hashDeterministicJson = (data: JsonValue): string => {
  const str = stableStringify(data);
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
};
