/**
 * Returns an array of numbers from start (inclusive) to end (exclusive)
 */
export function range(start: number, end: number) {
    return Array.from({ length: end - start }, (_, i) => {
        return i + start;
    });
}
