export function memoize<TQuery, TData>({
    fn,
    key = (query: TQuery) => JSON.stringify(query),
}: {
    fn: (query: TQuery) => TData;
    key?: (query: TQuery) => string;
}) {
    const cache = new Map<string, TData>();

    return (query: TQuery) => {
        const cacheKey = key(query);

        if (cache.has(cacheKey)) {
            return cache.get(cacheKey)!;
        }

        const result = fn(query);

        cache.set(cacheKey, result);

        return result;
    };
}
