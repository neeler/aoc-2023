import { ProcessStruct } from '~/types/ProcessStruct';

export type Comparator<T> = (first: T, second: T) => number;

export class PriorityQueue<T> implements ProcessStruct<T> {
    private readonly items: T[] = [];
    private readonly compare: Comparator<T>;

    constructor({ compare, items }: { compare: Comparator<T>; items?: T[] }) {
        this.compare = compare;
        if (items) {
            this.items = items;
            this.heapify();
        }
    }

    add(item: T) {
        this.items.push(item);
        this.heapifyUp();
    }

    pop() {
        if (this.isEmpty) {
            return undefined;
        }

        this.swap(0, this.items.length - 1);
        const headNode = this.items.pop();

        this.heapifyDown();

        return headNode;
    }

    process(fn: (item: T) => void) {
        while (this.items.length) {
            const node = this.pop();
            if (node) {
                fn(node);
            }
        }
    }

    get isEmpty() {
        return this.items.length === 0;
    }

    peek() {
        return this.items[0];
    }

    reset() {
        this.items.length = 0;
    }

    get length() {
        return this.items.length;
    }

    private heapify() {
        for (let i = Math.floor((this.items.length - 1) / 2); i >= 0; i--) {
            this.heapifyDown(i);
        }
    }

    private heapifyUp(i = this.items.length - 1) {
        const parent = this.parent(i);
        const current = this.items[i];
        if (parent && current && this.compare(parent, current) > 0) {
            this.swap(i, this.parentIndex(i));
            this.heapifyUp(this.parentIndex(i));
        }
    }

    private heapifyDown(i = 0) {
        const leftChild = this.leftChild(i);
        if (leftChild) {
            let minIndex = i;
            let minItem = this.items[minIndex];

            if (!minItem) {
                return;
            }
            if (this.compare(minItem, leftChild) > 0) {
                minIndex = this.leftChildIndex(i);
                minItem = leftChild;
            }

            const rightChild = this.rightChild(i);
            if (rightChild && this.compare(minItem, rightChild) > 0) {
                minIndex = this.rightChildIndex(i);
            }
            if (minIndex !== i) {
                this.swap(i, minIndex);
                this.heapifyDown(minIndex);
            }
        }
    }

    private swap(i: number, j: number) {
        const first = this.items[i];
        const second = this.items[j];
        if (!(first && second)) {
            throw new Error(`Cannot swap ${i} and ${j}`);
        }
        this.items[i] = second;
        this.items[j] = first;
    }

    private parent(i: number) {
        return this.items[this.parentIndex(i)];
    }
    private leftChild(i: number) {
        return this.items[this.leftChildIndex(i)];
    }
    private rightChild(i: number) {
        return this.items[this.rightChildIndex(i)];
    }

    private parentIndex(i: number) {
        return Math.floor((i - 1) / 2);
    }
    private leftChildIndex(i: number) {
        return i * 2 + 1;
    }
    private rightChildIndex(i: number) {
        return i * 2 + 2;
    }
}
