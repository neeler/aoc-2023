import { CustomSet } from '~/types/CustomSet';
import { Point, PointSet } from '~/types/Point';
import { Puzzle } from './Puzzle';

interface Part {
    number: number;
    index: Point;
    digitIndexes: PointSet;
    symbolNeighbors: Symbol[];
}

interface Symbol {
    index: Point;
    symbol: string;
    neighboringParts: Part[];
}

export const puzzle3 = new Puzzle<{
    parts: Part[];
    symbols: Symbol[];
}>({
    day: 3,
    parseInput: (fileData) => {
        const parts: Part[] = [];
        const seenSymbols = new CustomSet<Symbol, string>({
            getKey: (symbol) => symbol.index.toString(),
        });

        const charMatrix = fileData
            .split('\n')
            .map((row) => row.split('').concat('.'));
        const width = charMatrix[0]?.length ?? 0;
        const height = charMatrix.length;

        const matches = [...fileData.replace(/\n/g, '.').matchAll(/\d*/g)];

        for (const result of matches) {
            const match = result[0];
            const number = parseInt(match, 10);
            if (!isNaN(number) && result.index !== undefined) {
                const x = result.index % width;
                const y = Math.floor(result.index / width);
                const index = new Point(x, y);
                const digitIndexes = new PointSet();
                for (let dx = 0; dx < match.length; dx++) {
                    const newX = dx + x;
                    const dy = newX >= width ? 1 : 0;
                    digitIndexes.add(new Point(newX % width, y + dy));
                }
                const symbolNeighborIndexes = digitIndexes
                    .values()
                    .reduce((symbolIndexes, digitIndex) => {
                        const neighbors = digitIndex.neighbors({
                            maximumGridSize: new Point(width, height),
                            ignorePoints: digitIndexes,
                        });
                        neighbors.forEach((neighbor) => {
                            const adjacentChar =
                                charMatrix[neighbor.y]?.[neighbor.x];
                            if (
                                adjacentChar &&
                                adjacentChar !== '.' &&
                                isNaN(parseInt(adjacentChar, 10))
                            ) {
                                symbolIndexes.add(neighbor);
                            }
                        });
                        return symbolIndexes;
                    }, new PointSet());
                if (symbolNeighborIndexes.size() > 0) {
                    const symbolNeighbors: Symbol[] = symbolNeighborIndexes
                        .values()
                        .map((index) => {
                            const existingSymbol = seenSymbols.get(
                                index.toString()
                            );
                            if (existingSymbol) {
                                return existingSymbol;
                            }
                            const newSymbol: Symbol = {
                                index,
                                symbol: charMatrix[index.y]?.[index.x] ?? '',
                                neighboringParts: [],
                            };
                            seenSymbols.add(newSymbol);
                            return newSymbol;
                        });
                    const part: Part = {
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
            symbols: seenSymbols.values(),
        };
    },
    part1: ({ parts }) => {
        return parts.reduce((rowSum, part) => rowSum + part.number, 0);
    },
    part2: ({ symbols }) => {
        const gears = symbols.filter(
            (symbol) =>
                symbol.symbol === '*' && symbol.neighboringParts.length === 2
        );
        return gears.reduce(
            (rowSum, gear) =>
                rowSum +
                gear.neighboringParts.reduce(
                    (ratio, part) => ratio * part.number,
                    1
                ),
            0
        );
    },
});
