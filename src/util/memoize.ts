export function memoize<TQuery, TData>({
    key = (query: TQuery) => JSON.stringify(query),
    fn,
}: {
    key?: (query: TQuery) => string;
    fn: (query: TQuery) => TData;
}) {
    const cache = new Map<string, TData>();

    return (query: TQuery): TData => {
        const cacheKey = key(query);

        if (cache.has(cacheKey)) {
            return cache.get(cacheKey)!;
        }

        const result = fn(query);

        cache.set(cacheKey, result);

        return result;
    };
}
