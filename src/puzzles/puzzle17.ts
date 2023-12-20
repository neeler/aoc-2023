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
        return solveCruciblePath({
            nMaxInDirection: 3,
            startBlock,
            endBlock,
        });
    },
    part2: ({ startBlock, endBlock }) => {
        return solveCruciblePath({
            nMinInDirection: 4,
            nMaxInDirection: 10,
            startBlock,
            endBlock,
        });
    },
});

function solveCruciblePath({
    nMinInDirection = 1,
    nMaxInDirection,
    startBlock,
    endBlock,
}: {
    nMinInDirection?: number;
    nMaxInDirection: number;
    startBlock: CityBlock;
    endBlock: CityBlock;
}) {
    const bestSeenAtState = new Map<string, number>();

    let minHeatLoss = Infinity;

    const priorityQueue = new PriorityQueue<WalkState>({
        compare: (a, b) => a.totalHeatLoss - b.totalHeatLoss,
    });
    priorityQueue.add({
        blocks: [startBlock],
        totalHeatLoss: 0,
    });

    priorityQueue.process(
        ({
            blocks,
            lastDirection,
            nStepsInDirectionSoFar = 0,
            totalHeatLoss,
        }) => {
            const possibleNextDirections: Direction[] = [];

            const block = blocks[blocks.length - 1];
            if (!block) {
                return;
            }

            if (block === endBlock) {
                if (nStepsInDirectionSoFar >= nMinInDirection) {
                    minHeatLoss = Math.min(minHeatLoss, totalHeatLoss);
                }
                return;
            }

            /**
             * Get possible next directions
             */
            if (lastDirection) {
                if (nStepsInDirectionSoFar >= nMinInDirection) {
                    const oppositeDirection = OppositeDirections[lastDirection];
                    for (const direction of Directions) {
                        if (direction === oppositeDirection) {
                            continue;
                        }

                        if (
                            nStepsInDirectionSoFar >= nMaxInDirection &&
                            lastDirection === direction
                        ) {
                            continue;
                        }

                        possibleNextDirections.push(direction);
                    }
                } else {
                    possibleNextDirections.push(lastDirection);
                }
            } else {
                // Initial movement directions
                possibleNextDirections.push('right', 'down');
            }

            /**
             * Score and add next states to queue
             */
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

                const nextState: WalkState = {
                    blocks: blocks.concat(neighbor),
                    lastDirection: direction,
                    nStepsInDirectionSoFar:
                        lastDirection === direction
                            ? nStepsInDirectionSoFar + 1
                            : 1,
                    totalHeatLoss: totalHeatLoss + neighbor.heatLoss,
                };

                const stateKey = [
                    neighbor.position,
                    nextState.lastDirection,
                    nextState.nStepsInDirectionSoFar,
                ].join(':');
                const bestSeen = bestSeenAtState.get(stateKey);
                if (bestSeen && bestSeen <= nextState.totalHeatLoss) {
                    continue;
                }

                bestSeenAtState.set(stateKey, nextState.totalHeatLoss);
                priorityQueue.add(nextState);
            }
        }
    );

    return minHeatLoss;
}

interface WalkState {
    blocks: CityBlock[];
    lastDirection?: Direction;
    nStepsInDirectionSoFar?: number;
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
