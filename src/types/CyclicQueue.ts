export class CyclicQueue<T> {
    private readonly queue: T[] = [];

    enqueue(item: T) {
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
}
