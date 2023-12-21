export type Indices<
    L extends number,
    T extends number[] = []
> = T['length'] extends L ? T[number] : Indices<L, [T['length'], ...T]>;

export type LengthAtLeast<T extends readonly any[], L extends number> = Pick<
    Required<T>,
    Indices<L>
>;

export function hasLengthAtLeast<T extends readonly any[], L extends number>(
    arr: T,
    len: L
): arr is T & LengthAtLeast<T, L> {
    return arr.length >= len;
}

export type FixedSizeArray<T extends any, L extends number> = L extends 0
    ? never[]
    : Array<T> & LengthAtLeast<T[], L>;
