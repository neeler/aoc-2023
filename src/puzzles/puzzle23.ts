import { Grid } from '~/types/Grid';
import { PriorityQueue } from '~/types/PriorityQueue';
import { Puzzle } from './Puzzle';

export const puzzle23 = new Puzzle({
    day: 23,
    parseInput: (fileData) => fileData,
    part1: (fileData) => {
        const gardenMap = new GardenMap({
            fileData,
        });

        return gardenMap.longestPath();
    },
    part2: (fileData) => {
        const gardenMap = new GardenMap({
            fileData,
            slopesAsPaths: true,
        });

        return gardenMap.longestPath();
    },
});

class GardenMap {
    private readonly startNode: Node;
    private readonly endNode: Node;
    private readonly walkableNodes = new Set<Node>();
    private readonly distanceBetweenNodes = new Map<string, number>();

    constructor({
        fileData,
        slopesAsPaths = false,
    }: {
        fileData: string;
        slopesAsPaths?: boolean;
    }) {
        const grid = Grid.from2DArray<string, Node>(
            fileData
                .split('\n')
                .filter((s) => s)
                .map((s) => s.split('')),
            ({ row, col, input }) =>
                new Node({
                    symbol:
                        Symbols.SLOPES.includes(input as any) && slopesAsPaths
                            ? Symbols.PATH
                            : input,
                    row,
                    col,
                })
        );
        const startNode = grid.getAt(0, 1);
        if (!startNode) {
            throw new Error('No start node found');
        }
        const endNode = grid.getAt(grid.height - 1, grid.width - 2);
        if (!endNode) {
            throw new Error('No start node found');
        }

        /**
         * Build the graph
         * by connecting each node to its walkable neighbors
         */
        this.startNode = startNode;
        this.endNode = endNode;
        grid.forEach((node) => {
            if (node && !node.isForest) {
                this.walkableNodes.add(node);

                for (const direction of Object.values(Directions)) {
                    const positionDiff = PositionDiffs[direction];
                    const neighbor = grid.getAt(
                        node.row + positionDiff.y,
                        node.col + positionDiff.x
                    );

                    if (neighbor && !neighbor.isForest) {
                        this.walkableNodes.add(neighbor);

                        node.walkableNeighbors.add(neighbor);
                        node.neighborDirections.set(neighbor, direction);

                        neighbor.walkableNeighbors.add(node);
                        neighbor.neighborDirections.set(
                            node,
                            ReverseDirections[direction]
                        );

                        this.setDistanceBetweenNodes(node, neighbor, 1);
                    }
                }
            }
        });

        /**
         * Simple pruning only works when we don't have to think about
         * slope directionality
         * so skip it if we have to consider slopes
         */
        if (slopesAsPaths) {
            this.prune();
        }
    }

    /**
     * Prune the graph by collapsing paths
     * that are just middle nodes in a single-file path
     */
    private prune() {
        let pruned = true;
        while (pruned) {
            pruned = false;
            for (const node of this.walkableNodes) {
                if (
                    node !== this.startNode &&
                    node !== this.endNode &&
                    node.walkableNeighbors.size === 2
                ) {
                    const [firstNeighbor, secondNeighbor] = [
                        ...node.walkableNeighbors,
                    ];
                    if (!firstNeighbor || !secondNeighbor) {
                        throw new Error('missing expected neighbors');
                    }

                    /**
                     * Collapse this node into the first node
                     */
                    firstNeighbor.walkableNeighbors.delete(node);
                    secondNeighbor.walkableNeighbors.delete(node);
                    firstNeighbor.walkableNeighbors.add(secondNeighbor);
                    secondNeighbor.walkableNeighbors.add(firstNeighbor);

                    this.setDistanceBetweenNodes(
                        firstNeighbor,
                        secondNeighbor,
                        this.getDistanceBetweenNodes(firstNeighbor, node) +
                            this.getDistanceBetweenNodes(node, secondNeighbor)
                    );

                    this.walkableNodes.delete(node);
                    node.isCollapsed = true;

                    pruned = true;
                }
            }
        }
    }

    /**
     * Find the longest path from the start node to the end node
     */
    longestPath() {
        const queue = new PriorityQueue<{
            node: Node;
            path: Node[];
            pathLength: number;
        }>({
            compare: (a, b) => b.path.length - a.path.length,
        });

        queue.add({
            node: this.startNode,
            path: [this.startNode],
            pathLength: 0,
        });

        let longestPath = 0;

        queue.process(({ node, path, pathLength }) => {
            if (node === this.endNode) {
                if (pathLength > longestPath) {
                    longestPath = pathLength;
                }
                return;
            }

            for (const neighbor of node.walkableNeighbors) {
                if (
                    !path.includes(neighbor) &&
                    (neighbor.isPath ||
                        neighbor.matchesDirection(
                            node.neighborDirections.get(neighbor)!
                        ))
                ) {
                    queue.add({
                        node: neighbor,
                        path: [...path, neighbor],
                        pathLength:
                            pathLength +
                            this.getDistanceBetweenNodes(node, neighbor),
                    });
                }
            }
        });

        return longestPath;
    }

    private edgeKey(nodeA: Node, nodeB: Node) {
        return [nodeA.id, nodeB.id].sort().join(',');
    }

    private getDistanceBetweenNodes(nodeA: Node, nodeB: Node) {
        return this.distanceBetweenNodes.get(this.edgeKey(nodeA, nodeB)) ?? 0;
    }

    private setDistanceBetweenNodes(
        nodeA: Node,
        nodeB: Node,
        distance: number
    ) {
        this.distanceBetweenNodes.set(this.edgeKey(nodeA, nodeB), distance);
    }
}

const Directions = {
    Up: '^',
    Down: 'v',
    Left: '<',
    Right: '>',
} as const;

const ReverseDirections = {
    [Directions.Down]: '^',
    [Directions.Up]: 'v',
    [Directions.Right]: '<',
    [Directions.Left]: '>',
} as const;

type Direction = (typeof Directions)[keyof typeof Directions];

const PositionDiffs = {
    [Directions.Up]: { x: 0, y: -1 },
    [Directions.Down]: { x: 0, y: 1 },
    [Directions.Left]: { x: -1, y: 0 },
    [Directions.Right]: { x: 1, y: 0 },
} as const;

const Symbols = {
    PATH: '.',
    FOREST: '#',
    SLOPES: [Directions.Up, Directions.Down, Directions.Left, Directions.Right],
} as const;

class Node {
    readonly id: string;
    readonly symbol: string;
    readonly row: number;
    readonly col: number;
    readonly isPath: boolean;
    readonly isForest: boolean;
    readonly walkableNeighbors = new Set<Node>();
    readonly neighborDirections = new Map<Node, Direction>();

    isCollapsed = false;

    constructor({
        symbol,
        row,
        col,
    }: {
        symbol: string;
        row: number;
        col: number;
    }) {
        this.row = row;
        this.col = col;
        this.id = `${row},${col}`;
        this.symbol = symbol;
        this.isPath = symbol === Symbols.PATH;
        this.isForest = symbol === Symbols.FOREST;
    }

    matchesDirection(direction: Direction) {
        return this.symbol === direction;
    }

    toString() {
        if (this.isForest) {
            return ' ';
        }

        if (this.isCollapsed) {
            return 'x';
        }

        return this.symbol;
    }
}
