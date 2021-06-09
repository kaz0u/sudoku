/**
 * Returns the cartesian product of 2 arrays.
 */
export function cartesian<T, U>(a: readonly T[], b: readonly U[]): ([T] | [U] | [T, U])[] {
    if (a.length === 0) {
        return b.map((b: U) => [b]);
    }
    if (b.length === 0) {
        return a.map((a: T) => [a]);
    }
    return a.flatMap((a: T) => b.map((b: U) => [a, b] as [T, U]));
}
