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
        const instructions: Instruction[] = matches.map(([, , hexCode]) => ({
            direction: toDirection(hexCode[5]),
            nSteps: parseInt(hexCode.slice(0, 5), 16),
        }));

        let perimeter = 0;

        const vertices = instructions.reduce(
            (vertices, { direction, nSteps }) => {
                perimeter = perimeter + nSteps;
                const diff = PositionDiffs[direction];
                const lastVertex = vertices[vertices.length - 1]!;
                const newVertex = new Point(
                    lastVertex.x + diff.x * nSteps,
                    lastVertex.y + diff.y * nSteps
                );
                vertices.push(newVertex);

                return vertices;
            },
            [new Point(0, 0)]
        );
        vertices.pop();

        const nVertices = vertices.length;

        /**
         * Calculate the inner area of the polygon
         * using Green's theorem / Shoelace formula
         */
        const innerArea = Math.abs(
            vertices.reduce((sum, vertex, i) => {
                const nextVertex = vertices[(i + 1) % nVertices]!;
                return (
                    sum + (vertex.x + nextVertex.x) * (nextVertex.y - vertex.y)
                );
            }, 0) / 2
        );

        /**
         * Pick's theorem says that:
         * A = i + b / 2 - 1
         *
         * where
         * - A is the area of the polygon
         * - internal points (i)
         * - boundary points (b)
         *
         * We want to calculate i + b.
         * Rearrange the equation:
         * i = A - b / 2 + 1
         *
         * Add the perimeter to both sides:
         * i + b = A + b / 2 + 1
         */

        return innerArea + perimeter / 2 + 1;
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
}

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
