import { ProcessStruct } from '~/types/ProcessStruct';

export class Queue<T> implements ProcessStruct<T> {
    readonly queue: T[] = [];

    add(item: T) {
        this.queue.push(item);
    }

    process(fn: (item: T) => void) {
        while (this.queue.length) {
            const node = this.queue.shift();
            if (node) {
                fn(node);
            }
        }
    }

    reset() {
        this.queue.length = 0;
    }

    get length() {
        return this.queue.length;
    }
}
