import kleur from 'kleur';
import { Grid } from '~/types/Grid';
import { Queue } from '~/types/Queue';
import { Puzzle } from './Puzzle';

const neighborValidators: Record<
    string,
    {
        validNeighborPipes: string[];
        validFor: (value: string) => boolean;
    }
> = {
    '-1,0': {
        validNeighborPipes: ['S', '|', 'F', '7'],
        validFor: (v) => ['S', '|', 'L', 'J'].includes(v),
    },
    '1,0': {
        validNeighborPipes: ['S', '|', 'L', 'J'],
        validFor: (v) => ['S', '|', 'F', '7'].includes(v),
    },
    '0,-1': {
        validNeighborPipes: ['S', '-', 'L', 'F'],
        validFor: (v) => ['S', '-', '7', 'J'].includes(v),
    },
    '0,1': {
        validNeighborPipes: ['S', '-', 'J', '7'],
        validFor: (v) => ['S', '-', 'F', 'L'].includes(v),
    },
};

class Node {
    readonly isStart: boolean;
    readonly isPipe: boolean;
    readonly neighbors: Node[] = [];
    stepsAway = Infinity;
    isOutside = false;

    constructor(
        readonly config: {
            row: number;
            col: number;
            value: string;
            grid: Grid<Node>;
        }
    ) {
        this.isStart = this.config.value === 'S';
        this.isPipe = this.config.value !== '.';

        if (this.isStart) {
            this.stepsAway = 0;
        }
    }

    toString() {
        return this.isStart
            ? kleur.green(this.config.value)
            : this.config.value;
    }

    get isLoop() {
        return this.stepsAway !== Infinity;
    }

    get isEnclosed() {
        return !this.isLoop && !this.isOutside;
    }

    get orthogonalNeighbors() {
        return this.config.grid.getOrthogonalNeighborsOf(
            this.config.row,
            this.config.col
        );
    }

    calculateOutside() {
        if (this.isLoop) {
            this.isOutside = false;
            return;
        }
        if (this.isOutside) {
            this.isOutside = true;
            return;
        }
        const { row, col } = this.config;

        /**
         * If this node is on the edge, it is outside
         */
        const isOnEdge =
            row === 0 ||
            col === 0 ||
            row === this.config.grid.height - 1 ||
            col === this.config.grid.width - 1;

        if (isOnEdge) {
            this.isOutside = true;
            return;
        }

        /**
         * Get all relevant pipe nodes to the left of this node
         */
        const leftNodes: Record<string, number> = {};
        for (let iCol = 0; iCol < col; iCol++) {
            const node = this.config.grid.getAt(row, iCol);
            if (node?.isLoop && node.config.value !== '-') {
                leftNodes[node.config.value] =
                    (leftNodes[node.config.value] || 0) + 1;
            }
        }

        /**
         * If the pipe nodes to the left of this node have odd polarity,
         * this node is inside the loop
         */
        this.isOutside = !hasOddPolarity(leftNodes);
    }

    /**
     * Link up all loop neighbors
     */
    linkLoopNeighbors() {
        if (!this?.isPipe) {
            return;
        }

        const validPipeNeighbors = this.orthogonalNeighbors.filter(
            (neighbor) => {
                const rowDiff = neighbor.config.row - this.config.row;
                const colDiff = neighbor.config.col - this.config.col;

                const validators =
                    neighborValidators[[rowDiff, colDiff].toString()];

                if (!validators || !validators.validFor(this.config.value)) {
                    return false;
                }

                return validators.validNeighborPipes.includes(
                    neighbor.config.value
                );
            }
        );

        if (validPipeNeighbors.length >= 2) {
            this.neighbors.push(...validPipeNeighbors);
        }

        if (this.isStart) {
            this.config.value = calculateStartNodeValue(this);
        }
    }
}

export const puzzle10 = new Puzzle({
    day: 10,
    parseInput: (fileData) => {
        const valueGrid = fileData
            .split('\n')
            .filter((line) => line)
            .map((line) => line.split('').filter((s) => s));

        const width = valueGrid[0]?.length ?? 0;
        const height = valueGrid.length;

        if (!width || !height) {
            throw new Error('Invalid input dimensions');
        }

        /**
         * Create the grid
         */
        const grid = Grid.from2DArray<string, Node>(
            valueGrid,
            ({ input, row, col, grid }) =>
                new Node({
                    row,
                    col,
                    value: input,
                    grid,
                })
        );

        const startNode = grid.find((node) => node?.isStart ?? false);

        if (!startNode) {
            throw new Error('No start node found');
        }

        /**
         * Link up all the neighbors
         */
        grid.forEach((node) => node?.linkLoopNeighbors());

        /**
         * Calculate the steps away for all nodes on the loop
         */
        const queue = new Queue<Node>();
        queue.enqueue(startNode);
        queue.process((node) => {
            node.neighbors.forEach((neighbor) => {
                if (
                    neighbor.stepsAway === Infinity ||
                    neighbor.stepsAway > node.stepsAway + 1
                ) {
                    neighbor.stepsAway = node.stepsAway + 1;
                    queue.enqueue(neighbor);
                }
            });
        });

        /**
         * Calculate outside-ness for all nodes
         */
        grid.forEach((node) => node?.calculateOutside());

        return grid;
    },
    part1: (grid) => {
        /** Uncomment to draw the grid */
        // grid.draw();

        let maxStepsAway = 0;
        grid.forEach((node) => {
            if (node && node.stepsAway !== Infinity) {
                maxStepsAway = Math.max(maxStepsAway, node.stepsAway);
            }
        });

        return maxStepsAway;
    },
    part2: (grid) => {
        /** Uncomment to draw the grid with the enclosed areas marked */
        // grid.draw((node) => {
        //     if (node?.isLoop) {
        //         return '*';
        //     }
        //     if (node?.isOutside) {
        //         return 'O';
        //     }
        //     if (node?.isEnclosed) {
        //         return 'I';
        //     }
        //     return ' ';
        // });

        return grid.reduce((acc, node) => {
            return acc + (node?.isEnclosed ? 1 : 0);
        }, 0);
    },
});

/**
 * Figure out what value the start node is
 * based on the directions of the two neighbors
 */
function calculateStartNodeValue(node: Node) {
    if (!node.isStart) {
        throw new Error('Node is not a start node');
    }

    const [neighbor1, neighbor2] = node.neighbors;
    if (!neighbor1 || !neighbor2) {
        throw new Error('Start node has less than 2 neighbors');
    }

    const [rowDiff1, colDiff1] = [
        neighbor1.config.row - node.config.row,
        neighbor1.config.col - node.config.col,
    ];
    const [rowDiff2, colDiff2] = [
        neighbor2.config.row - node.config.row,
        neighbor2.config.col - node.config.col,
    ];

    if (rowDiff1 === 0 && rowDiff2 === 0) {
        return '-';
    }

    if (colDiff1 === 0 && colDiff2 === 0) {
        return '|';
    }

    if (rowDiff1 === 0) {
        // neighbor1 is horizontal
        // neighbor2 is vertical
        if (colDiff1 === -1) {
            // neighbor1 is left

            if (rowDiff2 === -1) {
                // neighbor2 is up
                return 'J';
            }

            // neighbor2 is down
            return '7';
        }

        // neighbor1 is right

        if (rowDiff2 === -1) {
            // neighbor2 is up
            return 'L';
        }

        // neighbor2 is down
        return 'F';
    }

    if (colDiff1 === 0) {
        // neighbor1 is vertical
        // neighbor2 is horizontal
        if (rowDiff1 === -1) {
            // neighbor1 is up

            if (colDiff2 === -1) {
                // neighbor2 is left
                return 'J';
            }

            // neighbor2 is right
            return 'L';
        }

        // neighbor1 is down

        if (colDiff2 === -1) {
            // neighbor2 is left
            return '7';
        }

        // neighbor2 is right
        return 'F';
    }

    throw new Error('Start node neighbors are not orthogonal');
}

/**
 * Figure out if the pipes seen as per the node count has odd polarity
 */
function hasOddPolarity({ ...nodeCount }: Record<string, number>) {
    let nBars = nodeCount['|'] ?? 0;

    const minOfFJ = Math.min(nodeCount['F'] ?? 0, nodeCount['J'] ?? 0);
    nodeCount['F'] = (nodeCount['F'] ?? 0) - minOfFJ;
    nodeCount['J'] = (nodeCount['J'] ?? 0) - minOfFJ;
    nBars += minOfFJ;

    const minOfL7 = Math.min(nodeCount['L'] ?? 0, nodeCount['7'] ?? 0);
    nodeCount['L'] = (nodeCount['L'] ?? 0) - minOfL7;
    nodeCount['7'] = (nodeCount['7'] ?? 0) - minOfL7;
    nBars += minOfL7;

    const polarity = (-1) ** nBars;

    return polarity < 0;
}
