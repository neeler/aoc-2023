export function sum(numbers: number[]): number {
    return numbers.reduce((sumSoFar, n) => sumSoFar + n, 0);
}

export function product(numbers: number[]): number {
    return numbers.reduce((productSoFar, n) => productSoFar * n, 1);
}

export function gcd(a: number, b: number): number {
    if (a === 0) {
        return b;
    }
    return gcd(b % a, a);
}

export function lcm(a: number, b: number) {
    if (!a || !b) {
        return 0;
    }
    return (a * b) / gcd(a, b);
}

export function mod(n: number, modulus: number) {
    return ((n % modulus) + modulus) % modulus;
}
