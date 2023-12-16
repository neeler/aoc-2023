import { Grid } from '~/types/Grid';
import { Point } from '~/types/Point';
import { Queue } from '~/types/Queue';
import { Puzzle } from './Puzzle';

const DirectionDiffs = {
    Up: new Point(0, -1),
    Down: new Point(0, 1),
    Left: new Point(-1, 0),
    Right: new Point(1, 0),
};
type Direction = keyof typeof DirectionDiffs;

class Tile {
    readonly position: Point;
    readonly symbol: string;
    readonly grid: Grid<Tile>;
    readonly lights: Direction[] = [];

    constructor({
        position,
        grid,
        symbol,
    }: {
        position: Point;
        grid: Grid<Tile>;
        symbol: string;
    }) {
        this.position = position;
        this.symbol = symbol;
        this.grid = grid;
    }

    reset() {
        this.lights.length = 0;
    }

    toString() {
        return this.symbol;
    }

    get isEnergized() {
        return this.lights.length > 0;
    }
}

export const puzzle16 = new Puzzle({
    day: 16,
    parseInput: (fileData) =>
        new Contraption(
            fileData
                .split('\n')
                .filter((s) => s)
                .map((s) => s.split(''))
        ),
    part1: (contraption) => {
        contraption.reset();
        contraption.addLight({
            direction: 'Right',
            row: 0,
            col: 0,
        });
        return contraption.strength;
    },
    part2: (contraption) => {
        const possibilities: number[] = [];

        for (let col = 0; col < contraption.width; col++) {
            contraption.reset();
            contraption.addLight({
                row: 0,
                col,
                direction: 'Down',
            });
            possibilities.push(contraption.strength);

            contraption.reset();
            contraption.addLight({
                row: contraption.height - 1,
                col,
                direction: 'Up',
            });
            possibilities.push(contraption.strength);
        }

        for (let row = 0; row < contraption.height; row++) {
            contraption.reset();
            contraption.addLight({
                row,
                col: 0,
                direction: 'Right',
            });
            possibilities.push(contraption.strength);

            contraption.reset();
            contraption.addLight({
                row,
                col: contraption.width - 1,
                direction: 'Left',
            });
            possibilities.push(contraption.strength);
        }

        return Math.max(...possibilities);
    },
});

class Contraption {
    readonly grid: Grid<Tile>;
    private readonly queue = new Queue<{
        tile?: Tile;
        direction: Direction;
    }>();

    constructor(data: string[][]) {
        this.grid = Grid.from2DArray<string, Tile>(
            data,
            ({ input, row, col, grid }) =>
                new Tile({
                    position: new Point(col, row),
                    grid,
                    symbol: input,
                })
        );
    }

    get width() {
        return this.grid.width;
    }

    get height() {
        return this.grid.height;
    }

    reset() {
        this.queue.reset();
        this.grid.forEach((tile) => {
            tile?.reset();
        });
    }

    addLight({
        direction,
        row: inputRow,
        col: inputCol,
        tile: inputTile,
    }: {
        row?: number;
        col?: number;
        tile?: Tile;
        direction: Direction;
    }) {
        const tile =
            inputTile ??
            (inputRow !== undefined && inputCol !== undefined
                ? this.grid.getAt(inputRow, inputCol)
                : undefined);

        this.queue.enqueue({ tile, direction });
        this.queue.process(({ tile, direction }) => {
            if (!tile || tile.lights.includes(direction)) {
                return;
            }

            tile.lights.push(direction);

            const directions = DirectionFlips[tile.symbol]?.[direction] ?? [
                direction,
            ];

            directions.forEach((direction) => {
                const diff = DirectionDiffs[direction];
                const nextTile = this.grid.getAt(
                    tile.position.row + diff.row,
                    tile.position.col + diff.col
                );
                if (nextTile) {
                    this.queue.enqueue({
                        tile: nextTile,
                        direction,
                    });
                }
            });
        });
    }

    get strength() {
        return this.grid.filter((tile) => tile.isEnergized).length;
    }
}

const DirectionFlips: Record<
    string,
    Partial<Record<Direction, Direction[]>>
> = {
    '/': {
        Up: ['Right'],
        Down: ['Left'],
        Left: ['Down'],
        Right: ['Up'],
    },
    '\\': {
        Up: ['Left'],
        Down: ['Right'],
        Left: ['Up'],
        Right: ['Down'],
    },
    '|': {
        Left: ['Up', 'Down'],
        Right: ['Up', 'Down'],
    },
    '-': {
        Up: ['Left', 'Right'],
        Down: ['Left', 'Right'],
    },
};
