import { ProcessStruct } from '~/types/ProcessStruct';

export class Stack<T> implements ProcessStruct<T> {
    private readonly stack: T[] = [];

    add(item: T) {
        this.stack.push(item);
    }

    process(fn: (item: T) => void) {
        while (this.stack.length) {
            const node = this.stack.pop();
            if (node) {
                fn(node);
            }
        }
    }

    reset() {
        this.stack.length = 0;
    }

    get length() {
        return this.stack.length;
    }
}
