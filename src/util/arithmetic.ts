export function sum(numbers: number[]): number {
    return numbers.reduce((sumSoFar, n) => sumSoFar + n, 0);
}

export function product(numbers: number[]): number {
    return numbers.reduce((productSoFar, n) => productSoFar * n, 1);
}
