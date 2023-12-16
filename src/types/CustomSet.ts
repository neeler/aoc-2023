/**
 * Essentially it's a Set where you can define what is used
 * to determine identity/equality.
 *
 * Really it's a wrapper around a Map.
 */
export class CustomSet<TData, TKey = string> {
    private itemMap = new Map<TKey, TData>();

    constructor(
        private readonly config: {
            getKey: (item: TData) => TKey;
        }
    ) {}

    add(item: TData) {
        const key = this.config.getKey(item);

        if (!this.itemMap.has(key)) {
            this.itemMap.set(key, item);
        }
    }

    get(key: TKey) {
        return this.itemMap.get(key);
    }

    delete(item: TData) {
        const key = this.config.getKey(item);
        this.deleteKey(key);
    }

    clear() {
        this.itemMap = new Map<TKey, TData>();
    }

    has(item: TData) {
        return this.hasKey(this.config.getKey(item));
    }

    hasKey(key: TKey) {
        return this.itemMap.has(key);
    }

    deleteKey(key: TKey) {
        if (this.itemMap.has(key)) {
            this.itemMap.delete(key);
        }
    }

    keys() {
        return [...this.itemMap.keys()];
    }

    values() {
        return [...this.itemMap.values()];
    }

    size() {
        return this.itemMap.size;
    }
}
