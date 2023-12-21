import { Grid } from '~/types/Grid';
import { Queue } from '~/types/Queue';
import { Puzzle } from './Puzzle';

class Node {
    readonly isStart: boolean;
    readonly isGarden: boolean;
    readonly isRock: boolean;
    distanceToStart: number = Infinity;

    constructor(
        readonly config: {
            row: number;
            col: number;
            grid: Grid<Node>;
            input: string;
        }
    ) {
        this.isStart = config.input === 'S';
        this.isGarden = this.isStart || config.input === '.';
        this.isRock = config.input === '#';
    }

    toString() {
        return this.config.input;
    }
}

export const puzzle21 = new Puzzle<string[][]>({
    day: 21,
    parseInput: (fileData) => {
        return fileData
            .split('\n')
            .filter((s) => s)
            .map((s) => s.split(''));
    },
    part1: (fileData) => {
        return countGardens(fileData, 64);
    },
    part2: (fileData) => {
        Array.from({ length: 10 }, (_, i) => i).forEach((n) => {
            console.log(`65 + ${n}*131`, countGardens(fileData, 65 + n * 131));
        });

        return;
    },
});

function countGardens(data: string[][], nSteps: number) {
    const grid = Grid.from2DArray<string, Node>(
        data,
        ({ row, col, grid, input }) =>
            new Node({
                row,
                col,
                grid,
                input,
            })
    );
    const startingNode = grid.find((node) => !!node?.isStart);
    if (!startingNode) {
        throw new Error('No starting node found');
    }

    // Use the starting node to calculate the distance to each node
    startingNode.distanceToStart = 0;
    const walk = new Queue<Node>();
    walk.add(startingNode);
    walk.process((node) => {
        const neighbors = grid.getOrthogonalNeighborsOf(
            node.config.row,
            node.config.col
        );
        for (const neighbor of neighbors) {
            if (!neighbor || neighbor.isStart || neighbor.isRock) {
                continue;
            }
            const distanceToNeighbor = node.distanceToStart + 1;
            if (distanceToNeighbor < neighbor.distanceToStart) {
                neighbor.distanceToStart = distanceToNeighbor;
                walk.add(neighbor);
            }
        }
    });

    return grid.filter(
        (node) =>
            node?.isGarden &&
            node.distanceToStart <= nSteps &&
            node.distanceToStart % 2 === nSteps % 2
    ).length;
}
