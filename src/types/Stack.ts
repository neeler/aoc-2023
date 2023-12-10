export class Stack<T> {
    private readonly stack: T[] = [];

    push(item: T) {
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
}
