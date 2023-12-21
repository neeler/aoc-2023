import { Grid } from '~/types/Grid';
import { Queue } from '~/types/Queue';
import { FixedSizeArray } from '~/types/arrays';
import { range } from '~/util/range';
import { Puzzle } from './Puzzle';

export const puzzle21 = new Puzzle({
    day: 21,
    parseInput: (fileData) => {
        const start = { row: 0, col: 0 };
        const grid = Grid.from2DArray<string, string>(
            fileData
                .split('\n')
                .filter((s) => s)
                .map((s) => s.split('')),
            ({ row, col, input }) => {
                if (input === MapSymbols.START) {
                    start.row = row;
                    start.col = col;
                    return MapSymbols.GARDEN;
                }
                return input;
            }
        );
        return {
            grid,
            start,
        };
    },
    part1: ({ grid, start }) => {
        return countGardens({
            grid,
            start,
            nSteps: 64,
        });
    },
    part2: ({ grid, start }) => {
        const maxSteps = 26501365;

        const cycleLength = grid.width;
        const x = Math.floor(maxSteps / cycleLength);
        const remainder = maxSteps % cycleLength;

        const manualResults = range(0, 4).map((x) =>
            countGardens({
                grid,
                start,
                nSteps: remainder + x * cycleLength,
            })
        ) as FixedSizeArray<number, 4>;

        /**
         * y = ax^2 + bx + c
         *
         * y(0) = c
         * y(1) = a + b + c
         * y(2) = 4a + 2b + c
         */
        const a =
            (manualResults[0] - 2 * manualResults[1] + manualResults[2]) / 2;
        const b = manualResults[1] - manualResults[0] - a;
        const c = manualResults[0];

        const quadratic = (x: number) => a * x ** 2 + b * x + c;

        /**
         * Sanity check
         */
        if (manualResults.some((r, i) => r !== quadratic(i))) {
            throw new Error('Quadratic assumption is wrong');
        }

        return quadratic(x);
    },
});

const MapSymbols = {
    START: 'S',
    GARDEN: '.',
    ROCK: '#',
};

function countGardens({
    grid,
    start,
    nSteps,
}: {
    grid: Grid<string>;
    start: { row: number; col: number };
    nSteps: number;
}) {
    const endedAt = new Set<string>();
    const visitedWithNSteps = new Map<string, number>();

    const walk = new Queue<{
        row: number;
        col: number;
        nStepsSoFar: number;
    }>();

    const targetPolarity = nSteps % 2;

    function addToQueue({
        row,
        col,
        nStepsSoFar = 0,
    }: {
        row: number;
        col: number;
        nStepsSoFar: number;
    }) {
        const key = `${row},${col}`;
        const pastVisitedDistance = visitedWithNSteps.get(key) ?? Infinity;

        if (nStepsSoFar >= pastVisitedDistance || nStepsSoFar > nSteps) {
            return;
        }

        visitedWithNSteps.set(key, nStepsSoFar);
        walk.add({
            row,
            col,
            nStepsSoFar,
        });
        if (nStepsSoFar % 2 === targetPolarity) {
            endedAt.add(key);
        }
    }

    addToQueue({
        row: start.row,
        col: start.col,
        nStepsSoFar: 0,
    });

    walk.process(({ row, col, nStepsSoFar }) => {
        Grid.orthogonalNeighbors.forEach(([rowDiff, colDiff]) => {
            const newRow = row + rowDiff;
            const newCol = col + colDiff;

            /**
             * Wrap around the grid
             * Make sure that we avoid modulos of negative numbers
             */
            let wrappedRow = newRow;
            while (wrappedRow < 0) {
                wrappedRow = wrappedRow + grid.height;
            }
            let wrappedCol = newCol;
            while (wrappedCol < 0) {
                wrappedCol = wrappedCol + grid.width;
            }

            const neighbor = grid.getAt(
                wrappedRow % grid.height,
                wrappedCol % grid.width
            );

            if (neighbor !== MapSymbols.ROCK) {
                addToQueue({
                    row: newRow,
                    col: newCol,
                    nStepsSoFar: nStepsSoFar + 1,
                });
            }
        });
    });

    return endedAt.size;
}
