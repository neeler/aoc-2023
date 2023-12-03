export type FixedSizeArray<T extends any, L extends number> = L extends 0
    ? never[]
    : Array<T> & {
          0: T;
          length: L;
      };
