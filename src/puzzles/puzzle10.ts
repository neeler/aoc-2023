import { sum } from '~/util/arithmetic';
import { Puzzle } from './Puzzle';

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
            nodes: Node[][];
        }
    ) {
        this.isStart = this.config.value === 'S';
        this.isPipe = this.config.value !== '.';
    }

    get isLoop() {
        return this.stepsAway !== Infinity;
    }

    get isEnclosed() {
        return !this.isLoop && !this.isOutside;
    }

    calculateOutside() {
        if (this.isLoop) {
            return false;
        }
        if (this.isOutside) {
            return true;
        }
        const { row, col } = this.config;

        const gridWidth = this.config.nodes[row]!.length;

        const isOnEdge =
            row === 0 ||
            col === 0 ||
            row === this.config.nodes.length - 1 ||
            col === this.config.nodes[row]!.length - 1;

        if (isOnEdge) {
            this.setIsOutside(true);
            return true;
        }

        // L J 7 F

        const leftNodes: Record<string, number> = {};
        const rightNodes: Record<string, number> = {};

        for (let iCol = 0; iCol < col; iCol++) {
            const node = this.config.nodes[row]![iCol];
            if (node?.isLoop && node.config.value !== '-') {
                leftNodes[node.config.value] =
                    (leftNodes[node.config.value] || 0) + 1;
            }
        }

        for (let iCol = col + 1; iCol < gridWidth; iCol++) {
            const node = this.config.nodes[row]![iCol];
            if (node?.isLoop && node.config.value !== '-') {
                rightNodes[node.config.value] =
                    (rightNodes[node.config.value] || 0) + 1;
            }
        }

        const hasOddPolarity = (nodes: Record<string, number>) => {
            let nBars = nodes['|'] ?? 0;

            const minOfFJ = Math.min(nodes['F'] ?? 0, nodes['J'] ?? 0);
            nodes['F'] = (nodes['F'] ?? 0) - minOfFJ;
            nodes['J'] = (nodes['J'] ?? 0) - minOfFJ;
            nBars += minOfFJ;

            const minOfL7 = Math.min(nodes['L'] ?? 0, nodes['7'] ?? 0);
            nodes['L'] = (nodes['L'] ?? 0) - minOfL7;
            nodes['7'] = (nodes['7'] ?? 0) - minOfL7;
            nBars += minOfL7;

            let polarity = (-1) ** nBars;

            if (polarity < 0) {
                return true;
            }

            const minOfLJ = Math.min(nodes['L'] ?? 0, nodes['J'] ?? 0);
            nodes['L'] = (nodes['L'] ?? 0) - minOfLJ;
            nodes['J'] = (nodes['J'] ?? 0) - minOfLJ;

            const minOfF7 = Math.min(nodes['F'] ?? 0, nodes['7'] ?? 0);
            nodes['F'] = (nodes['F'] ?? 0) - minOfF7;
            nodes['7'] = (nodes['7'] ?? 0) - minOfF7;
        };

        const hasOddLeftPolarity = hasOddPolarity(leftNodes);
        const hasOddRightPolarity = hasOddPolarity(rightNodes);

        const isOutside = !hasOddLeftPolarity && !hasOddRightPolarity;

        if (isOutside) {
            this.setIsOutside(isOutside);
        }

        return isOutside;
    }

    setIsOutside(value: boolean) {
        this.isOutside = value;

        // Iterate for all neighbors, including diagonals
        for (let rowDiff = -1; rowDiff <= 1; rowDiff++) {
            for (let colDiff = -1; colDiff <= 1; colDiff++) {
                if (rowDiff === 0 && colDiff === 0) {
                    continue;
                }
                const neighborRow = this.config.row + rowDiff;
                const neighborCol = this.config.col + colDiff;
                const neighbor =
                    neighborRow >= 0 && neighborCol >= 0
                        ? this.config.nodes[neighborRow]?.[neighborCol]
                        : undefined;
                if (neighbor && !neighbor.isLoop && !neighbor.isOutside) {
                    neighbor.setIsOutside(value);
                }
            }
        }
    }

    setup() {
        const neighborIndexDiffs: {
            diff: [number, number];
            pipes: string[];
            valid: boolean;
        }[] = [
            {
                diff: [-1, 0],
                pipes: ['S', '|', 'F', '7'],
                valid: ['S', '|', 'L', 'J'].includes(this.config.value),
            },
            {
                diff: [1, 0],
                pipes: ['S', '|', 'L', 'J'],
                valid: ['S', '|', 'F', '7'].includes(this.config.value),
            },
            {
                diff: [0, -1],
                pipes: ['S', '-', 'L', 'F'],
                valid: ['S', '-', '7', 'J'].includes(this.config.value),
            },
            {
                diff: [0, 1],
                pipes: ['S', '-', 'J', '7'],
                valid: ['S', '-', 'F', 'L'].includes(this.config.value),
            },
        ];
        if (this?.isPipe) {
            const validPipeNeighbors = neighborIndexDiffs.reduce<Node[]>(
                (acc, { diff: [rowDiff, colDiff], pipes, valid }) => {
                    if (!valid) {
                        return acc;
                    }
                    const neighborRow = this.config.row + rowDiff;
                    const neighborCol = this.config.col + colDiff;
                    const neighbor =
                        neighborRow >= 0 && neighborCol >= 0
                            ? this.config.nodes[neighborRow]?.[neighborCol]
                            : undefined;
                    if (neighbor && pipes.includes(neighbor.config.value)) {
                        acc.push(neighbor);
                    }
                    return acc;
                },
                []
            );
            if (validPipeNeighbors.length >= 2) {
                this.neighbors.push(...validPipeNeighbors);
            }
        }
        if (this.isStart) {
            // Figure out what value the start node is
            // based on the directions of the two neighbors
            const [neighbor1, neighbor2] = this.neighbors;
            if (!neighbor1 || !neighbor2) {
                throw new Error('Start node has less than 2 neighbors');
            }
            const [rowDiff1, colDiff1] = [
                neighbor1.config.row - this.config.row,
                neighbor1.config.col - this.config.col,
            ];
            const [rowDiff2, colDiff2] = [
                neighbor2.config.row - this.config.row,
                neighbor2.config.col - this.config.col,
            ];

            if (rowDiff1 === 0 && rowDiff2 === 0) {
                this.config.value = '-';
            } else if (colDiff1 === 0 && colDiff2 === 0) {
                this.config.value = '|';
            } else if (rowDiff1 === 0) {
                // neighbor1 is horizontal
                // neighbor2 is vertical
                if (colDiff1 === -1) {
                    // neighbor1 is left
                    if (rowDiff2 === -1) {
                        // neighbor2 is up
                        this.config.value = 'J';
                    } else {
                        // neighbor2 is down
                        this.config.value = '7';
                    }
                } else {
                    // neighbor1 is right
                    if (rowDiff2 === -1) {
                        // neighbor2 is up
                        this.config.value = 'L';
                    } else {
                        // neighbor2 is down
                        this.config.value = 'F';
                    }
                }
            } else if (colDiff1 === 0) {
                // neighbor1 is vertical
                // neighbor2 is horizontal
                if (rowDiff1 === -1) {
                    // neighbor1 is up
                    if (colDiff2 === -1) {
                        // neighbor2 is left
                        this.config.value = 'J';
                    } else {
                        // neighbor2 is right
                        this.config.value = 'L';
                    }
                } else {
                    // neighbor1 is down
                    if (colDiff2 === -1) {
                        // neighbor2 is left
                        this.config.value = '7';
                    } else {
                        // neighbor2 is right
                        this.config.value = 'F';
                    }
                }
            }
        }
    }
}

export const puzzle10 = new Puzzle({
    day: 10,
    parseInput: (fileData) => {
        const grid = fileData
            .split('\n')
            .filter((line) => line)
            .map((line) => line.split('').filter((s) => s));

        const width = grid[0]!.length;
        const height = grid.length;

        const nodes: Node[][] = grid.map(() => []);

        grid.forEach((row, rowIndex) => {
            nodes[rowIndex] = row.map((value, colIndex) => {
                return new Node({
                    row: rowIndex,
                    col: colIndex,
                    value,
                    nodes,
                });
            });
        });

        let startNode: Node | undefined;

        nodes.forEach((row) => {
            row.forEach((node) => {
                node.setup();
                if (node.isStart) {
                    startNode = node;
                    startNode.stepsAway = 0;
                }
            });
        });

        if (!startNode) {
            throw new Error('No start node found');
        }

        const queue: Node[] = [startNode];

        while (queue.length) {
            const node = queue.shift()!;
            node.neighbors.forEach((neighbor) => {
                if (
                    neighbor.stepsAway === Infinity ||
                    neighbor.stepsAway > node.stepsAway + 1
                ) {
                    neighbor.stepsAway = node.stepsAway + 1;
                    queue.push(neighbor);
                }
            });
        }

        return {
            startNode,
            nodes,
            width,
            height,
        };
    },
    part1: ({ nodes }) => {
        let maxStepsAway = 0;
        nodes.forEach((row) => {
            row.forEach((node) => {
                if (node.stepsAway !== Infinity) {
                    maxStepsAway = Math.max(maxStepsAway, node.stepsAway);
                }
            });
        });
        printNodes(nodes, (node) => node.config.value);
        return maxStepsAway;
    },
    part2: ({ nodes }) => {
        printNodes(nodes, (node) => node.config.value);

        nodes.forEach((row) => {
            row.forEach((node) => {
                node.calculateOutside();
            });
        });
        printNodes(nodes, enclosedStatus);

        return nodes.reduce<number>((acc, row) => {
            return (
                acc +
                row.reduce<number>((acc, node) => {
                    return acc + (node.isEnclosed ? 1 : 0);
                }, 0)
            );
        }, 0);
    },
});

function enclosedStatus(node: Node) {
    if (node.isLoop) {
        return '*';
    }
    if (node.isOutside) {
        return 'O';
    }
    if (node.isEnclosed) {
        return 'I';
    }
    return ' ';
}

function printNodes(nodes: Node[][], printer: (node: Node) => string) {
    console.log(
        `${nodes
            .map((row) =>
                row
                    .map((node) => {
                        return printer(node);
                    })
                    .join('')
            )
            .join('\n')}
`
    );
}
