import { CycleAwareLooper } from '~/types/CycleAwareLooper';
import { Grid } from '~/types/Grid';
import { Puzzle } from './Puzzle';

type RockSymbol = '.' | '#' | 'O';

export const puzzle14 = new Puzzle({
    day: 14,
    parseInput: (data) => {
        const stringGrid = data
            .split('\n')
            .filter((s) => s)
            .map((s) => s.split(''));

        const width = Math.max(...stringGrid.map((row) => row.length));
        const height = stringGrid.length;

        if (!width || !height) {
            throw new Error('Invalid input dimensions');
        }

        const grid = new RockGrid({
            minX: 0,
            minY: 0,
            maxX: width - 1,
            maxY: height - 1,
        });

        stringGrid.forEach((row, iRow) => {
            row.forEach((initialValue, iCol) => {
                grid.setAt(
                    iRow,
                    iCol,
                    new Node({
                        row: iRow,
                        col: iCol,
                        initialValue,
                    })
                );
            });
        });

        return grid;
    },
    part1: (grid) => {
        grid.tilt('up');
        return grid.northLoad;
    },
    part2: (grid) => {
        /**
         * Run the simulation for the given number of cycles.
         * If we detect a cycle, we can skip ahead to the end of the cycle.
         * If we don't detect a cycle, we can just run the simulation normally.
         * Luckily, there are indeed cycles that appear relatively quickly.
         *
         * This uses a simple string key to represent the state of the grid.
         * It's a big string, but it's still fast enough to work.
         */
        const cycleDetector = new CycleAwareLooper({
            nIterations: 1e9,
            action: () => {
                grid.tilt('up');
                grid.tilt('left');
                grid.tilt('down');
                grid.tilt('right');

                return grid.key;
            },
        });
        cycleDetector.run();

        return grid.northLoad;
    },
});

type Direction = 'up' | 'down' | 'left' | 'right';

const DirectionDiff = {
    up: { row: -1, col: 0 },
    down: { row: 1, col: 0 },
    left: { row: 0, col: -1 },
    right: { row: 0, col: 1 },
};

class Node {
    private symbol: RockSymbol;

    constructor(
        readonly config: {
            row: number;
            col: number;
            initialValue?: string;
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

class RockGrid extends Grid<Node> {
    get northLoad() {
        return this.reduce((acc, node) => {
            return acc + (node?.hasRoundRock ? this.height - node.row : 0);
        }, 0);
    }

    /**
     * Moves the rock in the given direction, if possible.
     * Returns the node that the rock was moved to.
     */
    moveRock({ node, direction }: { node: Node; direction: Direction }) {
        if (!node.hasRoundRock) {
            return node;
        }

        // Get neighbor in direction
        const diff = DirectionDiff[direction];
        const neighbor = this.getAt(node.row + diff.row, node.col + diff.col);
        if (!neighbor?.isEmpty) {
            return node;
        }

        // If neighbor is empty, move node in that direction
        node.removeRoundRock();
        neighbor.placeRoundRock();

        return neighbor;
    }

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
    tilt(direction: Direction) {
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
                for (let row = 0; row < this.height; row++) {
                    addRocks(this.getRow(row));
                }
                break;
            }
            case 'down': {
                // Move rows one at a time, starting from the bottom
                for (let row = this.height - 1; row >= 0; row--) {
                    addRocks(this.getRow(row));
                }
                break;
            }
            case 'left': {
                // Move cols one at a time, starting from the left
                for (let col = 0; col < this.width; col++) {
                    addRocks(this.getColumn(col));
                }
                break;
            }
            case 'right': {
                // Move cols one at a time, starting from the right
                for (let col = this.width - 1; col >= 0; col--) {
                    addRocks(this.getColumn(col));
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
                const updatedNode = this.moveRock({
                    node: rock,
                    direction,
                });
                changed = changed || updatedNode !== rock;
                rocks.push(updatedNode);
            }
        } while (changed);
    }
}
