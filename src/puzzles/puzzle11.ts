import kleur from 'kleur';
import { Grid } from '~/types/Grid';
import { Puzzle } from './Puzzle';

const Symbols = {
    GALAXY: '#',
    EMPTY: '.',
};

class Node {
    isGalaxy: boolean;
    isEmpty: boolean;

    constructor(
        readonly config: {
            row: number;
            col: number;
            symbol: string;
            grid: Grid<Node>;
        }
    ) {
        this.isGalaxy = this.config.symbol === Symbols.GALAXY;
        this.isEmpty = this.config.symbol === Symbols.EMPTY;
    }

    toString() {
        return this.config.symbol === Symbols.GALAXY
            ? kleur.green(this.config.symbol)
            : this.config.symbol;
    }
}

export const puzzle11 = new Puzzle({
    day: 11,
    parseInput: (fileData) => {
        const data = fileData
            .split('\n')
            .filter((s) => s)
            .map((s) => s.split('').filter((s) => s));
        const emptyRowIndexes: number[] = [];
        const emptyColIndexes: number[] = [];
        const firstRow = data[0] ?? [];

        data.forEach((row, rowIndex) => {
            if (row.every((x) => x === Symbols.EMPTY)) {
                emptyRowIndexes.push(rowIndex);
            }
        });
        firstRow.forEach((_, colIndex) => {
            if (data.every((row) => row[colIndex] === Symbols.EMPTY)) {
                emptyColIndexes.push(colIndex);
            }
        });

        const grid = Grid.from2DArray<string, Node>(
            data,
            ({ input, row, col, grid }) =>
                new Node({
                    symbol: input,
                    row,
                    col,
                    grid,
                })
        );

        return {
            grid,
            galaxies: grid.filter((node) => node.isGalaxy),
            emptyRowIndexes,
            emptyColIndexes,
        };
    },
    part1: ({ galaxies, emptyRowIndexes, emptyColIndexes }) => {
        return calculateSumOfDistances({
            expansionFactor: 2,
            galaxies,
            emptyRowIndexes,
            emptyColIndexes,
        });
    },
    part2: ({ galaxies, emptyColIndexes, emptyRowIndexes }) => {
        return calculateSumOfDistances({
            expansionFactor: 1000000,
            galaxies,
            emptyRowIndexes,
            emptyColIndexes,
        });
    },
});

function calculateSumOfDistances({
    expansionFactor,
    galaxies,
    emptyRowIndexes,
    emptyColIndexes,
}: {
    expansionFactor: number;
    galaxies: Node[];
    emptyRowIndexes: number[];
    emptyColIndexes: number[];
}) {
    let sumOfDistances = 0;

    galaxies.forEach((galaxy, iGalaxy) => {
        galaxies.forEach((otherGalaxy, iOtherGalaxy) => {
            if (iGalaxy === iOtherGalaxy) {
                return;
            }

            const minRow = Math.min(galaxy.config.row, otherGalaxy.config.row);
            const maxRow = Math.max(galaxy.config.row, otherGalaxy.config.row);
            const nEmptyRowsBetween = emptyRowIndexes.filter(
                (i) => i > minRow && i < maxRow
            ).length;

            const minCol = Math.min(galaxy.config.col, otherGalaxy.config.col);
            const maxCol = Math.max(galaxy.config.col, otherGalaxy.config.col);
            const nEmptyColsBetween = emptyColIndexes.filter(
                (i) => i > minCol && i < maxCol
            ).length;

            sumOfDistances +=
                maxRow -
                minRow +
                (maxCol - minCol) +
                (nEmptyRowsBetween + nEmptyColsBetween) * (expansionFactor - 1);
        });
    });

    return sumOfDistances / 2;
}
