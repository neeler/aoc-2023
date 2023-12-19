import { CustomSet } from '~/types/CustomSet';
import { Point } from '~/types/Point';
import { Stack } from '~/types/Stack';
import { VirtualGrid } from '~/types/VirtualGrid';
import { Puzzle } from './Puzzle';

export const puzzle18 = new Puzzle({
    day: 18,
    parseInput: (fileData) => {
        const matches = [...fileData.matchAll(/(\w)\s+(\d*)\s+\(#(.+)\)/g)];
        return matches.map(
            ([, match1, match2, match3]): [string, string, string] => {
                if (!match1 || !match2 || !match3) {
                    throw new Error(`Invalid input: ${fileData}`);
                }
                return [match1, match2, match3];
            }
        );
    },
    part1: (matches) => {
        const instructions: Instruction[] = matches.map(
            ([direction, nSteps]) => ({
                direction: toDirection(direction),
                nSteps: parseInt(nSteps, 10),
            })
        );

        const terrainMap = new TerrainMap();
        terrainMap.processInstructions(instructions);

        terrainMap.fillEdges().trenchInnards();

        return terrainMap.trenchCount;
    },
    part2: (matches) => {
        // const instructions: Instruction[] = matches.map(
        //     ([direction, nSteps]) => ({
        //         direction: toDirection(direction),
        //         nSteps: parseInt(nSteps, 10),
        //     })
        // );
        //
        // const terrainMap = new GiantTerrainMap();
        // terrainMap.processInstructions(instructions);
        //
        // return terrainMap.trenchCount;

        const instructions: Instruction[] = matches.map(([, , hexCode]) => ({
            direction: toDirection(hexCode[5]),
            nSteps: parseInt(hexCode.slice(0, 5), 16),
        }));

        const terrainMap = new GiantTerrainMap();
        terrainMap.processInstructions(instructions);

        return terrainMap.trenchCount;
    },
});

class TerrainMap {
    readonly grid = new VirtualGrid<Terrain>({
        getBlank: (row, col) => new Terrain(new Point(col, row)),
    });

    processInstructions(instructions: Instruction[]) {
        let position = new Point(0, 0);

        const startTerrain = new Terrain(position);
        startTerrain.trench();
        this.grid.setAt(position.y, position.x, startTerrain);

        instructions.forEach(({ direction, nSteps }) => {
            const diff = PositionDiffs[direction];

            for (let i = 0; i < nSteps; i += 1) {
                position = new Point(position.x + diff.x, position.y + diff.y);

                const terrain =
                    this.grid.getAt(position.y, position.x) ??
                    new Terrain(position);
                this.grid.setAt(position.y, position.x, terrain);
                terrain.trench();
            }
        });

        return this;
    }

    fillEdges() {
        const fillStack = new Stack<Terrain>();

        [
            ...this.grid.getRow(this.grid.minY),
            ...this.grid.getRow(this.grid.maxY),
            ...this.grid.getColumn(this.grid.minX),
            ...this.grid.getColumn(this.grid.maxX),
        ].forEach((terrain) => {
            if (terrain && !terrain.isTrenched) {
                terrain.edge();
                fillStack.add(terrain);
            }
        });

        fillStack.process((terrain) => {
            const neighbors = this.grid.getOrthogonalNeighborsOf(
                terrain.position.row,
                terrain.position.col
            );
            neighbors.forEach((neighbor) => {
                if (!neighbor?.isTrenched && !neighbor?.isEdge) {
                    neighbor.edge();
                    fillStack.add(neighbor);
                }
            });
        });

        return this;
    }

    trenchInnards() {
        this.grid.forEach((terrain) => {
            if (terrain && !terrain?.isEdge && !terrain?.isTrenched) {
                terrain.trench();
            }
        });

        return this;
    }

    get trenchCount() {
        return this.grid.reduce(
            (sum, terrain) => sum + (terrain?.isTrenched ? 1 : 0),
            0
        );
    }

    draw() {
        this.grid.draw();
    }
}

class GiantTerrainMap {
    trenchedRanges: {
        direction: Direction;
        range: Range;
    }[] = [];
    verticalRanges: {
        direction: Direction;
        range: Range;
    }[] = [];
    pointsInRange = new CustomSet<Point>({
        getKey: (point) => point.toString(),
    });

    minX = 0;
    minY = 0;
    maxX = 0;
    maxY = 0;

    processInstructions(instructions: Instruction[]) {
        let position = new Point(0, 0);

        instructions.forEach(({ direction, nSteps }) => {
            const diff = PositionDiffs[direction];
            const finalPoint = new Point(
                position.x + diff.x * nSteps,
                position.y + diff.y * nSteps
            );

            const range: Range = [position, finalPoint];
            this.trenchedRanges.push({
                direction,
                range,
            });

            const minCol = Math.min(position.x, finalPoint.x);
            const maxCol = Math.max(position.x, finalPoint.x);
            const minRow = Math.min(position.y, finalPoint.y);
            const maxRow = Math.max(position.y, finalPoint.y);
            for (let row = minRow; row <= maxRow; row += 1) {
                for (let col = minCol; col <= maxCol; col += 1) {
                    this.pointsInRange.add(new Point(col, row));
                }
            }

            if (isVerticalDirection(direction)) {
                this.verticalRanges.push({
                    direction,
                    range,
                });
            }

            position = finalPoint;

            this.minX = Math.min(this.minX, position.x);
            this.minY = Math.min(this.minY, position.y);
            this.maxX = Math.max(this.maxX, position.x);
            this.maxY = Math.max(this.maxY, position.y);
        });

        // Sort vertical ranges from left to right
        this.verticalRanges.sort((a, b) => a.range[0].col - b.range[0].col);

        return this;
    }

    get width() {
        return this.maxX - this.minX + 1;
    }

    get height() {
        return this.maxY - this.minY + 1;
    }

    static isInRange(row: number, col: number, range: Range) {
        const [start, end] = range;
        return (
            Math.min(start.col, end.col) <= col &&
            col <= Math.max(start.col, end.col) &&
            Math.min(start.row, end.row) <= row &&
            row <= Math.max(start.row, end.row)
        );
    }

    get trenchCount() {
        let sum = 0;

        for (let row = this.minY; row <= this.maxY; row += 1) {
            const verticalsSeen: Direction[] = [];

            let verticalRangesRemaining = this.verticalRanges.slice();

            for (let col = this.minX; col <= this.maxX; col += 1) {
                const isInRange = this.trenchedRanges.find(({ range }) =>
                    GiantTerrainMap.isInRange(row, col, range)
                );
                if (isInRange) {
                    sum += 1;
                    continue;
                }

                verticalRangesRemaining = verticalRangesRemaining.filter(
                    ({ direction, range }) => {
                        const [start, end] = range;

                        if (start.col < col) {
                            if (
                                GiantTerrainMap.isInRange(row, start.col, range)
                            ) {
                                verticalsSeen.push(direction);
                            }

                            return false;
                        }

                        return true;
                    }
                );

                const firstVerticalSeen = verticalsSeen[0];
                const lastVerticalSeen =
                    verticalsSeen[verticalsSeen.length - 1];

                if (
                    firstVerticalSeen === undefined ||
                    lastVerticalSeen === undefined
                ) {
                    continue;
                }

                if (firstVerticalSeen === lastVerticalSeen) {
                    sum += 1;
                }
            }
        }

        return sum;
    }
}

type Range = [Point, Point];

interface Instruction {
    direction: Direction;
    nSteps: number;
}

class Terrain {
    readonly position: Point;
    isTrenched: boolean;
    isEdge = false;

    constructor(position: Point) {
        this.position = position;
        this.isTrenched = false;
    }

    trench() {
        this.isTrenched = true;
    }

    edge() {
        this.isEdge = true;
    }

    toString() {
        return this.isTrenched ? '#' : this.isEdge ? ' ' : '.';
    }
}

const Directions = {
    Up: 'U',
    Down: 'D',
    Left: 'L',
    Right: 'R',
} as const;
const verticalDirections: Direction[] = [Directions.Up, Directions.Down];
function isVerticalDirection(direction: Direction) {
    return verticalDirections.includes(direction);
}

type Direction = (typeof Directions)[keyof typeof Directions];

const PositionDiffs = {
    [Directions.Up]: { x: 0, y: -1 },
    [Directions.Down]: { x: 0, y: 1 },
    [Directions.Left]: { x: -1, y: 0 },
    [Directions.Right]: { x: 1, y: 0 },
} as const;

function toDirection(direction?: string): Direction {
    switch (direction) {
        case Directions.Up:
        case '3':
            return Directions.Up;
        case Directions.Down:
        case '1':
            return Directions.Down;
        case Directions.Left:
        case '2':
            return Directions.Left;
        case Directions.Right:
        case '0':
            return Directions.Right;
        default:
            throw new Error(`Invalid direction: ${direction}`);
    }
}
