import kleur from 'kleur';
import { Grid } from '~/types/Grid';
import { sum } from '~/util/arithmetic';
import { Puzzle } from './Puzzle';

const Symbols = {
    ASH: '.',
    ROCK: '#',
} as const;

type Symbol = (typeof Symbols)[keyof typeof Symbols];

const SymbolFlips = {
    [Symbols.ASH]: Symbols.ROCK,
    [Symbols.ROCK]: Symbols.ASH,
} as const;

class Node {
    private symbol: Symbol;
    private readonly initialSymbol: Symbol;

    constructor(
        readonly config: {
            symbol: string;
            row: number;
            col: number;
            grid: Grid<Node>;
        }
    ) {
        switch (config.symbol) {
            case Symbols.ASH:
            case Symbols.ROCK:
                this.symbol = config.symbol;
                this.initialSymbol = config.symbol;
                break;
            default:
                throw new Error(`Invalid symbol: ${config.symbol}`);
        }
    }

    flip() {
        this.symbol = SymbolFlips[this.symbol];
    }

    get isFlipped() {
        return this.symbol !== this.initialSymbol;
    }

    reset() {
        this.symbol = this.initialSymbol;
    }

    toString() {
        return this.symbol;
    }
}

export const puzzle13 = new Puzzle({
    day: 13,
    parseInput: (fileData) => {
        const patternStrings: string[][] = [[]];

        fileData.split('\n').forEach((line, i) => {
            const lastPatternString = patternStrings[patternStrings.length - 1];
            if (!lastPatternString || !line) {
                patternStrings.push([]);
            }
            if (line && lastPatternString) {
                lastPatternString.push(line);
            }
        });

        const patterns = patternStrings
            .filter((p) => p.length)
            .map((patternStrings) =>
                Grid.from2DArray<string, Node>(
                    patternStrings.map((s) => s.split('')),
                    ({ input, grid, row, col }) =>
                        new Node({
                            symbol: input,
                            row,
                            col,
                            grid,
                        })
                )
            );

        return { patterns };
    },
    part1: ({ patterns }) => {
        return sum(
            patterns.map((pattern) => {
                const verticalLineOfReflection =
                    getVerticalLinesOfReflection(pattern);
                const horizontalLineOfReflection =
                    getHorizontalLinesOfReflection(pattern);
                return (
                    verticalLineOfReflection + 100 * horizontalLineOfReflection
                );
            })
        );
    },
    part2: ({ patterns }) => {
        return sum(
            patterns.map((pattern) => {
                const initialVerticalLineOfReflection =
                    getVerticalLinesOfReflection(pattern);
                const initialHorizontalLineOfReflection =
                    getHorizontalLinesOfReflection(pattern);
                const hasVerticalReflection =
                    initialVerticalLineOfReflection > 0;
                const hasHorizontalReflection =
                    initialHorizontalLineOfReflection > 0;

                // Replace exactly one position in the pattern
                // with a different symbol, and see if the
                // vertical and horizontal lines of reflection
                // change.

                for (let row = 0; row < pattern.height; row++) {
                    for (let col = 0; col < pattern.width; col++) {
                        const node = pattern.getAt(row, col);
                        if (node === undefined) {
                            continue;
                        }

                        node.flip();

                        const newVerticalLineOfReflection =
                            getVerticalLinesOfReflection(pattern, {
                                valuesToIgnore: hasVerticalReflection
                                    ? [initialVerticalLineOfReflection]
                                    : [],
                            });
                        const newHorizontalLineOfReflection =
                            getHorizontalLinesOfReflection(pattern, {
                                valuesToIgnore: hasHorizontalReflection
                                    ? [initialHorizontalLineOfReflection]
                                    : [],
                            });

                        if (
                            newVerticalLineOfReflection &&
                            (hasHorizontalReflection ||
                                newVerticalLineOfReflection !==
                                    initialVerticalLineOfReflection)
                        ) {
                            node.reset();
                            return newVerticalLineOfReflection;
                        }

                        if (
                            newHorizontalLineOfReflection &&
                            (hasVerticalReflection ||
                                newHorizontalLineOfReflection !==
                                    initialHorizontalLineOfReflection)
                        ) {
                            node.reset();
                            return newHorizontalLineOfReflection * 100;
                        }

                        node.reset();
                    }
                }

                throw new Error('No new reflection found');
            })
        );
    },
});

function getVerticalLinesOfReflection(
    grid: Grid<Node>,
    {
        valuesToIgnore = [],
    }: {
        valuesToIgnore?: number[];
    } = {}
) {
    for (
        let nColumnsLeftOfReflection = 1;
        nColumnsLeftOfReflection < grid.width;
        nColumnsLeftOfReflection++
    ) {
        if (valuesToIgnore.includes(nColumnsLeftOfReflection)) {
            continue;
        }
        const maxDx = Math.min(
            nColumnsLeftOfReflection,
            grid.width - nColumnsLeftOfReflection
        );
        let isReflected = true;
        for (let dx = 1; dx <= maxDx; dx++) {
            const leftColumn = grid.getColumn(nColumnsLeftOfReflection - dx);
            const rightColumn = grid.getColumn(
                nColumnsLeftOfReflection + dx - 1
            );
            if (leftColumn.toString() !== rightColumn.toString()) {
                isReflected = false;
                break;
            }
        }
        if (isReflected) {
            return nColumnsLeftOfReflection;
        }
    }

    return 0;
}

function getHorizontalLinesOfReflection(
    grid: Grid<Node>,
    {
        valuesToIgnore = [],
    }: {
        valuesToIgnore?: number[];
    } = {}
) {
    for (
        let nRowsAboveReflection = 1;
        nRowsAboveReflection < grid.height;
        nRowsAboveReflection++
    ) {
        if (valuesToIgnore.includes(nRowsAboveReflection)) {
            continue;
        }
        const maxDy = Math.min(
            nRowsAboveReflection,
            grid.height - nRowsAboveReflection
        );
        let isReflected = true;
        for (let dy = 1; dy <= maxDy; dy++) {
            const rowAbove = grid.getRow(nRowsAboveReflection - dy);
            const rowBelow = grid.getRow(nRowsAboveReflection + dy - 1);
            if (rowAbove?.toString() !== rowBelow?.toString()) {
                isReflected = false;
                break;
            }
        }
        if (isReflected) {
            return nRowsAboveReflection;
        }
    }

    return 0;
}

/**
 * Draw a node, with a different color if it has been modified.
 *
 * Example:
 * ```
 * node.flip();
 * pattern.draw(drawModifiedNode);
 * ```
 */
function drawModifiedNode(node?: Node) {
    return node?.isFlipped
        ? kleur.red(node.toString())
        : node?.toString() ?? ' ';
}
