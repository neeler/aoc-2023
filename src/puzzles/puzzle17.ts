import { Grid } from '~/types/Grid';
import { Point } from '~/types/Point';
import { PriorityQueue } from '~/types/PriorityQueue';
import { Puzzle } from './Puzzle';

export const puzzle17 = new Puzzle({
    day: 17,
    parseInput: (fileData) => {
        const cityGrid = Grid.from2DArray<string, CityBlock>(
            fileData
                .split('\n')
                .filter((s) => s)
                .map((s) => s.split('')),
            ({ input, row, col, grid }) =>
                new CityBlock({
                    position: new Point(col, row),
                    grid,
                    heatLoss: parseInt(input, 10),
                })
        );
        const startBlock = cityGrid.getAt(0, 0);

        if (!startBlock) {
            throw new Error('No start block');
        }

        const endBlock = cityGrid.getAt(
            cityGrid.height - 1,
            cityGrid.width - 1
        );

        if (!endBlock) {
            throw new Error('No end block');
        }

        return {
            cityGrid,
            startBlock,
            endBlock,
        };
    },
    part1: ({ startBlock, endBlock }) => {
        const bestSeenAtState = new Map<string, number>();

        let minHeatLoss = Infinity;

        const priorityQueue = new PriorityQueue<WalkState>({
            priority: (item) => item.totalHeatLoss,
            ascending: false,
        });
        priorityQueue.enqueue({
            blocks: [startBlock],
            directions: [],
            totalHeatLoss: 0,
        });

        priorityQueue.process(({ blocks, directions, totalHeatLoss }) => {
            const possibleNextDirections: Direction[] = [];

            const [lastDirection] = directions.slice(-1);
            const lastThreeDirections = directions.slice(-3);

            if (lastDirection) {
                const oppositeDirection = OppositeDirections[lastDirection];
                for (const direction of Directions) {
                    if (direction === oppositeDirection) {
                        continue;
                    }

                    if (
                        lastThreeDirections.length === 3 &&
                        lastThreeDirections.every((d) => d === direction)
                    ) {
                        continue;
                    }

                    possibleNextDirections.push(direction);
                }
            } else {
                possibleNextDirections.push('right', 'down');
            }

            const block = blocks[blocks.length - 1];
            if (!block) {
                return;
            }
            if (block === endBlock) {
                minHeatLoss = Math.min(minHeatLoss, totalHeatLoss);
                return;
            }

            for (const direction of possibleNextDirections) {
                const neighbor = block.getNeighborIn(direction);
                if (!neighbor) {
                    continue;
                }
                if (blocks.includes(neighbor)) {
                    continue;
                }
                if (totalHeatLoss + neighbor.heatLoss > minHeatLoss) {
                    continue;
                }

                const nextState = {
                    blocks: blocks.concat(neighbor),
                    directions: directions.concat(direction),
                    totalHeatLoss: totalHeatLoss + neighbor.heatLoss,
                };

                const stateKey = [
                    neighbor.position,
                    nextState.directions.slice(-3),
                ].join(':');
                const bestSeen = bestSeenAtState.get(stateKey);
                if (bestSeen && bestSeen <= nextState.totalHeatLoss) {
                    continue;
                }

                bestSeenAtState.set(stateKey, nextState.totalHeatLoss);
                priorityQueue.enqueue(nextState);
            }
        });

        return minHeatLoss;
    },
    skipPart1: true,
    part2: ({ startBlock, endBlock }) => {
        const nMinInDirection = 4;
        const nMaxInDirection = 10;

        const bestSeenAtState = new Map<string, number>();

        let minHeatLoss = Infinity;

        const priorityQueue = new PriorityQueue<WalkState>({
            priority: (item) => item.totalHeatLoss,
            ascending: false,
        });
        priorityQueue.enqueue({
            blocks: [startBlock],
            directions: [],
            totalHeatLoss: 0,
        });

        priorityQueue.process(({ blocks, directions, totalHeatLoss }) => {
            const possibleNextDirections: Direction[] = [];

            const [lastDirection] = directions.slice(-1);
            const lastFourDirections = directions.slice(-nMinInDirection);
            const lastTenDirections = directions.slice(-nMaxInDirection);

            if (lastDirection) {
                if (lastFourDirections.some((d) => d !== lastDirection)) {
                    possibleNextDirections.push(lastDirection);
                } else {
                    const oppositeDirection = OppositeDirections[lastDirection];
                    for (const direction of Directions) {
                        if (direction === oppositeDirection) {
                            continue;
                        }

                        if (
                            lastTenDirections.length === nMaxInDirection &&
                            lastTenDirections.every((d) => d === direction)
                        ) {
                            continue;
                        }

                        possibleNextDirections.push(direction);
                    }
                }
            } else {
                possibleNextDirections.push('right', 'down');
            }

            const block = blocks[blocks.length - 1];
            if (!block) {
                return;
            }
            if (block === endBlock) {
                if (lastFourDirections.every((d) => d === lastDirection)) {
                    minHeatLoss = Math.min(minHeatLoss, totalHeatLoss);
                }
                return;
            }

            for (const direction of possibleNextDirections) {
                const neighbor = block.getNeighborIn(direction);
                if (!neighbor) {
                    continue;
                }
                if (blocks.includes(neighbor)) {
                    continue;
                }
                if (totalHeatLoss + neighbor.heatLoss > minHeatLoss) {
                    continue;
                }

                const nextState = {
                    blocks: blocks.concat(neighbor),
                    directions: directions.concat(direction),
                    totalHeatLoss: totalHeatLoss + neighbor.heatLoss,
                };

                const stateKey = [
                    neighbor.position,
                    nextState.directions.slice(-nMaxInDirection),
                ].join(':');
                const bestSeen = bestSeenAtState.get(stateKey);
                if (bestSeen && bestSeen <= nextState.totalHeatLoss) {
                    continue;
                }

                bestSeenAtState.set(stateKey, nextState.totalHeatLoss);
                priorityQueue.enqueue(nextState);
            }
        });

        return minHeatLoss;
    },
});

interface WalkState {
    blocks: CityBlock[];
    directions: Direction[];
    totalHeatLoss: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

const DirectionDiff = {
    up: { row: -1, col: 0 },
    down: { row: 1, col: 0 },
    left: { row: 0, col: -1 },
    right: { row: 0, col: 1 },
} satisfies Record<Direction, { row: number; col: number }>;
const Directions = Object.keys(DirectionDiff) as Direction[];
const OppositeDirections = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
} satisfies Record<Direction, Direction>;

class CityBlock {
    readonly position: Point;
    readonly heatLoss: number;
    readonly grid: Grid<CityBlock>;

    constructor({
        position,
        grid,
        heatLoss,
    }: {
        position: Point;
        grid: Grid<CityBlock>;
        heatLoss: number;
    }) {
        this.position = position;
        this.grid = grid;
        this.heatLoss = heatLoss;
    }

    toString() {
        return this.heatLoss.toString();
    }

    getNeighborIn(direction: Direction) {
        const diff = DirectionDiff[direction];
        return this.grid.getAt(
            this.position.row + diff.row,
            this.position.col + diff.col
        );
    }
}
