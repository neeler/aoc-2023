import { Puzzle } from './Puzzle';

type Index = [number, number];
interface Part {
    number: number;
    index: Index;
    digitIndexes: Index[];
    symbolNeighbors: Symbol[];
}

interface Symbol {
    index: Index;
    symbol: string;
    neighboringParts: Part[];
}

export const puzzle3 = new Puzzle<{
    parts: Part[];
    symbols: Symbol[];
}>({
    day: 3,
    parseLineByLine: false,
    parseInput: (inputText) => {
        const parts: Part[] = [];
        const symbolCache: Record<string, Symbol> = {};

        const charMatrix = inputText
            .split('\n')
            .map((row) => row.split('').concat('.'));
        const width = charMatrix[0]?.length ?? 0;
        const height = charMatrix.length;

        const matches = [...inputText.replace(/\n/g, '.').matchAll(/\d*/g)];

        for (const result of matches) {
            const match = result[0];
            const number = parseInt(match, 10);
            if (!isNaN(number) && result.index !== undefined) {
                const x = result.index % width;
                const y = Math.floor(result.index / width);
                const index: Index = [x, y];
                const digitIndexes: Index[] = [];
                for (let dx = 0; dx < match.length; dx++) {
                    const newX = dx + x;
                    const dy = newX >= width ? 1 : 0;
                    digitIndexes.push([newX % width, y + dy]);
                }
                const symbolNeighborIndexes = digitIndexes.reduce<Index[]>(
                    (symbolIndexes, digitIndex) => {
                        const neighbors = getNeighbors(digitIndex);
                        const symbolNeighbors = neighbors.filter(
                            ([adjX, adjY]) => {
                                const adjacentChar = charMatrix[adjY]?.[adjX];
                                return (
                                    adjacentChar &&
                                    adjacentChar !== '.' &&
                                    isNaN(parseInt(adjacentChar, 10))
                                );
                            }
                        );
                        for (const symbolIndex of symbolNeighbors) {
                            if (
                                !symbolIndexes.some(
                                    (si) =>
                                        si.toString() === symbolIndex.toString()
                                )
                            ) {
                                symbolIndexes.push(symbolIndex);
                            }
                        }
                        return symbolIndexes;
                    },
                    []
                );
                if (symbolNeighborIndexes.length) {
                    const symbolNeighbors: Symbol[] = symbolNeighborIndexes.map(
                        (index) => {
                            const existingSymbol =
                                symbolCache[index.toString()];
                            if (existingSymbol) {
                                return existingSymbol;
                            }
                            const newSymbol: Symbol = {
                                index,
                                symbol: charMatrix[index[1]]?.[index[0]] ?? '',
                                neighboringParts: [],
                            };
                            symbolCache[newSymbol.index.toString()] = newSymbol;
                            return newSymbol;
                        }
                    );
                    const part = {
                        number,
                        index,
                        digitIndexes,
                        symbolNeighbors,
                    };
                    symbolNeighbors.forEach((symbol) => {
                        symbol.neighboringParts.push(part);
                    });
                    parts.push(part);
                }
            }
        }

        return {
            parts,
            symbols: Object.values(symbolCache),
        };
    },
    part1: (rows) => {
        return rows.reduce(
            (sum, { parts }) =>
                sum + parts.reduce((rowSum, part) => rowSum + part.number, 0),
            0
        );
    },
    part2: (rows) => {
        return rows.reduce((sum, { parts, symbols }) => {
            const gears = symbols.filter(
                (symbol) =>
                    symbol.symbol === '*' &&
                    symbol.neighboringParts.length === 2
            );
            return (
                sum +
                gears.reduce(
                    (rowSum, gear) =>
                        rowSum +
                        gear.neighboringParts.reduce(
                            (ratio, part) => ratio * part.number,
                            1
                        ),
                    0
                )
            );
        }, 0);
    },
});

function getNeighbors([x, y]: Index): Index[] {
    const indexes: Index[] = [];

    for (let dx = -1; dx < 2; dx++) {
        for (let dy = -1; dy < 2; dy++) {
            if (dx || dy) {
                const newX = x + dx;
                const newY = y + dy;
                if (newX >= 0 && newY >= 0) {
                    indexes.push([x + dx, y + dy]);
                }
            }
        }
    }

    return indexes;
}
