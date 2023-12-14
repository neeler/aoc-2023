import { Grid } from '~/types/Grid';
import { Puzzle } from './Puzzle';

type RockSymbol = '.' | '#' | 'O';

class Node {
    private symbol: RockSymbol;

    constructor(
        readonly config: {
            row: number;
            col: number;
            initialValue?: string;
            grid: Grid<Node>;
        }
    ) {
        switch (config.initialValue) {
            case '.':
            case '#':
            case 'O':
                this.symbol = config.initialValue;
                break;
            default:
                throw new Error('Invalid initial value');
        }
    }

    get row() {
        return this.config.row;
    }

    get col() {
        return this.config.col;
    }

    get hasRoundRock() {
        return this.symbol === 'O';
    }

    placeRoundRock() {
        this.symbol = 'O';
    }

    removeRoundRock() {
        this.symbol = '.';
    }

    get isEmpty() {
        return this.symbol === '.';
    }

    toString() {
        return this.symbol;
    }
}

export const puzzle14 = new Puzzle({
    day: 14,
    parseInput: (data) => data,
    part1: (fileData) => {
        const grid = buildGrid(fileData);
        slideGrid({
            grid,
            direction: 'up',
        });
        return calculateNorthLoad(grid);
    },
    part2: (fileData) => {
        const nCycles = 1e9;

        const grid = buildGrid(fileData);

        const previousStates = new Map<string, number>();

        let cycleStart: number | undefined;
        let cycleLength: number | undefined;

        /**
         * Run the simulation for the given number of cycles.
         * If we detect a cycle, we can skip ahead to the end of the cycle.
         * If we don't detect a cycle, we can just run the simulation normally.
         * Luckily, there are indeed cycles that appear relatively quickly.
         *
         * This uses a simple string key to represent the state of the grid.
         * It's a big string, but it's still fast enough to work.
         */
        for (let iCycle = 0; iCycle < nCycles; iCycle++) {
            slideGrid({
                grid,
                direction: 'up',
            });
            slideGrid({
                grid,
                direction: 'left',
            });
            slideGrid({
                grid,
                direction: 'down',
            });
            slideGrid({
                grid,
                direction: 'right',
            });

            const gridKey = grid.key;

            if (previousStates.has(gridKey)) {
                if (cycleStart === undefined) {
                    cycleStart = previousStates.get(gridKey)!;
                    cycleLength = iCycle - cycleStart;

                    const nRemainingCycles = nCycles - iCycle;
                    iCycle +=
                        Math.floor(nRemainingCycles / cycleLength) *
                        cycleLength;
                }
            }

            previousStates.set(gridKey, iCycle);
        }

        return calculateNorthLoad(grid);
    },
});

function calculateNorthLoad(grid: Grid<Node>) {
    return grid.reduce((acc, node) => {
        return acc + (node?.hasRoundRock ? grid.height - node.row : 0);
    }, 0);
}

type Direction = 'up' | 'down' | 'left' | 'right';

const DirectionDiff = {
    up: { row: -1, col: 0 },
    down: { row: 1, col: 0 },
    left: { row: 0, col: -1 },
    right: { row: 0, col: 1 },
};

/**
 * Slides the grid in the given direction, moving rocks as needed.
 *
 * Works by moving rows or columns one at a time,
 * cascading from the top, bottom, left, or right,
 * depending on the direction of movement.
 *
 * Works iteratively, moving rocks one whole map at a time,
 * until no more rocks can be moved.
 *
 * When any given rock can't be moved anymore,
 * it is removed from the list of rocks to consider
 * to avoid unnecessary iterations.
 */
function slideGrid({
    grid,
    direction,
}: {
    grid: Grid<Node>;
    direction: Direction;
}) {
    let rocks: Node[] = [];
    const addRocks = (nodes?: (Node | undefined)[]) => {
        nodes?.forEach((node) => {
            if (node?.hasRoundRock) {
                rocks.push(node);
            }
        });
    };

    switch (direction) {
        case 'up': {
            // Move rows one at a time, starting from the top
            for (let row = 0; row < grid.height; row++) {
                addRocks(grid.getRow(row));
            }
            break;
        }
        case 'down': {
            // Move rows one at a time, starting from the bottom
            for (let row = grid.height - 1; row >= 0; row--) {
                addRocks(grid.getRow(row));
            }
            break;
        }
        case 'left': {
            // Move cols one at a time, starting from the left
            for (let col = 0; col < grid.width; col++) {
                addRocks(grid.getColumn(col));
            }
            break;
        }
        case 'right': {
            // Move cols one at a time, starting from the right
            for (let col = grid.width - 1; col >= 0; col--) {
                addRocks(grid.getColumn(col));
            }
            break;
        }
    }

    let changed: boolean;
    do {
        changed = false;

        const rocksForLoop = rocks.slice();
        rocks = [];

        for (const rock of rocksForLoop) {
            const updatedNode = moveIfPossible({
                grid,
                node: rock,
                direction,
            });
            changed = changed || updatedNode !== rock;
            rocks.push(updatedNode);
        }
    } while (changed);
}

function moveIfPossible({
    grid,
    node,
    direction,
}: {
    grid: Grid<Node>;
    node: Node;
    direction: Direction;
}) {
    if (!node.hasRoundRock) {
        return node;
    }

    // Get neighbor in direction
    const diff = DirectionDiff[direction];
    const neighbor = grid.getAt(node.row + diff.row, node.col + diff.col);
    if (!neighbor?.isEmpty) {
        return node;
    }

    // If neighbor is empty, move node in that direction
    node.removeRoundRock();
    neighbor.placeRoundRock();

    return neighbor;
}

function buildGrid(fileData: string) {
    return Grid.from2DArray<string, Node>(
        fileData
            .split('\n')
            .filter((s) => s)
            .map((s) => s.split('')),
        (node) => {
            return new Node({
                row: node.row,
                col: node.col,
                initialValue: node.input,
                grid: node.grid,
            });
        }
    );
}
