export interface ProcessStruct<T> {
    add: (item: T) => void;

    process: (fn: (item: T) => void) => void;

    reset: () => void;

    length: number;
}
