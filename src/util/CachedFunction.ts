export class CachedFunction<TParam, TReturn, TKey = TParam> {
    cache = new Map<TKey, TReturn>();
    constructor(
        private readonly config: {
            func: (p: TParam) => TReturn;
            getKey: (p: TParam) => TKey;
        }
    ) {}

    run(p: TParam): TReturn {
        const key = this.config.getKey(p);

        const cachedValue = this.cache.get(key);
        if (cachedValue !== undefined) {
            return cachedValue;
        }

        const result = this.config.func(p);

        this.cache.set(key, result);

        return result;
    }
}
