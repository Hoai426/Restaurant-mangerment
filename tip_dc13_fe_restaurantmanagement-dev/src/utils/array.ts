/**
 * Compares two arrays as sets with O(N) time complexity.
 * Returns true if both arrays contain the exact same set of unique elements,
 * regardless of their order.
 *
 * @param a First array
 * @param b Second array
 * @returns boolean indicating whether both arrays have identical elements as sets
 */
export function areSetsEqual<T>(a: T[], b: T[]): boolean {
  const setA = new Set(a);
  const setB = new Set(b);

  if (setA.size !== setB.size) return false;

  for (const item of setA) {
    if (!setB.has(item)) return false;
  }

  return true;
}
