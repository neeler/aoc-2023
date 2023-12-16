import { Grid } from '~/types/Grid';
import { Point } from '~/types/Point';
import { Queue } from '~/types/Queue';
import { Puzzle } from './Puzzle';

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
        contraption.addLight({
            row: 0,
            col: 0,
            direction: 'Right',
        });
        return contraption.strength;
    },
    part2: (contraption) => {
        let maxStrength = 0;

        for (let col = 0; col < contraption.grid.width; col++) {
            contraption.reset();
            contraption.addLight({
                row: 0,
                col,
                direction: 'Down',
            });
            maxStrength = Math.max(maxStrength, contraption.strength);

            contraption.reset();
            contraption.addLight({
                row: contraption.grid.height - 1,
                col,
                direction: 'Up',
            });
            maxStrength = Math.max(maxStrength, contraption.strength);
        }

        for (let row = 0; row < contraption.grid.height; row++) {
            contraption.reset();
            contraption.addLight({
                row,
                col: 0,
                direction: 'Right',
            });
            maxStrength = Math.max(maxStrength, contraption.strength);

            contraption.reset();
            contraption.addLight({
                row,
                col: contraption.grid.width - 1,
                direction: 'Left',
            });
            maxStrength = Math.max(maxStrength, contraption.strength);
        }

        return maxStrength;
    },
});

/**
 * The xy-differences for each direction.
 */
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
    readonly lights = new Set<Direction>();

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

    /**
     * Reset the tile to its initial state.
     */
    reset() {
        this.lights.clear();
    }

    toString() {
        return this.symbol;
    }

    /**
     * Whether the tile is energized
     * AKA the tile has any light traveling through.
     */
    get isEnergized() {
        return this.lights.size > 0;
    }
}

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

    /**
     * Reset the contraption to its initial state.
     */
    reset() {
        this.queue.reset();
        this.grid.forEach((tile) => {
            tile?.reset();
        });
    }

    /**
     * Add a light to the contraption.
     * @param options The options for adding the light.
     * @param options.direction The direction the light is coming from.
     * @param [options.row] The row of the tile to add the light to.
     * @param [options.col] The column of the tile to add the light to.
     * @param [options.tile] The tile to add the light to.
     */
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

        /**
         * Add the starting tile to the queue.
         */
        this.queue.enqueue({ tile, direction });

        /**
         * Process the queue.
         */
        this.queue.process(({ tile, direction }) => {
            /**
             * If the tile is undefined
             * or already has a light coming from this direction,
             * skip it.
             */
            if (!tile || tile.lights.has(direction)) {
                return;
            }

            /**
             * Add the light to the tile.
             */
            tile.lights.add(direction);

            /**
             * Get the directions to add to the queue,
             * based on the tile's symbol
             * and the direction the light is coming from.
             */
            const directions = DirectionFlips[tile.symbol]?.[direction] ?? [
                direction,
            ];

            directions.forEach((direction) => {
                /**
                 * Get the next tile in the given direction.
                 */
                const diff = DirectionDiffs[direction];
                const nextTile = this.grid.getAt(
                    tile.position.row + diff.row,
                    tile.position.col + diff.col
                );
                if (nextTile) {
                    /**
                     * Add the tile to the queue.
                     */
                    this.queue.enqueue({
                        tile: nextTile,
                        direction,
                    });
                }
            });
        });
    }

    /**
     * The strength of the contraption.
     * This is the number of tiles that are energized.
     */
    get strength() {
        return this.grid.filter((tile) => tile.isEnergized).length;
    }
}

/**
 * Map of symbols and incoming directions to the resulting directions.
 */
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
