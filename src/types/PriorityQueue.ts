export class PriorityQueue<T> {
    private readonly queue: T[] = [];
    private readonly priorities: number[] = [];

    constructor(
        private readonly config: {
            priority: (item: T) => number;
            ascending?: boolean;
        }
    ) {}

    enqueue(item: T) {
        const itemPriority = this.config.priority(item);
        const insertIndex = this.priorities.findIndex((queueItemPriority) =>
            this.config.ascending
                ? queueItemPriority > itemPriority
                : queueItemPriority < itemPriority
        );
        if (insertIndex === -1) {
            this.queue.push(item);
            this.priorities.push(itemPriority);
        } else {
            this.queue.splice(insertIndex, 0, item);
            this.priorities.splice(insertIndex, 0, itemPriority);
        }
    }

    process(fn: (item: T) => void) {
        while (this.queue.length) {
            const node = this.queue.pop();
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
