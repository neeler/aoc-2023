import kleur from 'kleur';
import { Point } from '~/types/Point';

export class Grid<T extends { toString: () => string }> {
    private readonly grid: (T | undefined)[][] = [];
    private readonly minX: number;
    private readonly minY: number;
    readonly width: number;
    readonly height: number;
    private minXUpdated: number | undefined;
    private blank: string;
    private drawFn?: (data: T | undefined) => string;

    constructor({
        minX = 0,
        minY = 0,
        maxX,
        maxY,
        defaultValue,
        blank = ' ',
        drawFn,
    }: {
        minX?: number;
        minY?: number;
        maxX: number;
        maxY: number;
        defaultValue?: (row: number, col: number) => T;
        blank?: string;
        drawFn?: (data: T | undefined) => string;
    }) {
        this.grid = Array.from({ length: maxY - minY + 1 }, (_, row) =>
            Array.from({ length: maxX - minX + 1 }, (_, col) =>
                defaultValue?.(row, col)
            )
        );
        this.minX = minX;
        this.minY = minY;
        this.width = maxX + 1;
        this.height = maxY + 1;
        this.blank = blank;
        this.drawFn = drawFn;
    }

    static from2DArray<TInput, TNode extends { toString: () => string }>(
        arr: TInput[][],
        getNode: (data: {
            input: TInput;
            row: number;
            col: number;
            grid: Grid<TNode>;
        }) => TNode
    ): Grid<TNode> {
        const width = arr[0]?.length ?? 0;
        const height = arr.length;

        if (!width || !height) {
            throw new Error('Invalid input dimensions');
        }

        const grid = new Grid<TNode>({
            minX: 0,
            minY: 0,
            maxX: width - 1,
            maxY: height - 1,
        });

        arr.forEach((row, iRow) => {
            row.forEach((input, iCol) => {
                grid.setAt(
                    iRow,
                    iCol,
                    getNode({
                        input,
                        row: iRow,
                        col: iCol,
                        grid,
                    })
                );
            });
        });

        return grid;
    }

    static orthogonalNeighbors: [number, number][] = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
    ];

    static allNeighbors: [number, number][] = [
        ...Grid.orthogonalNeighbors,
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
    ];

    getAt(rowIndex: number, colIndex: number) {
        return this.grid[rowIndex - this.minY]?.[colIndex - this.minX];
    }

    setAt(rowIndex: number, colIndex: number, value: T) {
        const row = this.grid[rowIndex - this.minY] ?? [];
        row[colIndex - this.minX] = value;
        this.minXUpdated =
            this.minXUpdated === undefined
                ? colIndex
                : Math.min(this.minXUpdated, colIndex);
        this.grid[rowIndex - this.minY] = row;
    }

    getRow(y: number) {
        return this.grid[y - this.minY];
    }

    forEach(fn: (data: T | undefined, row: number, col: number) => void) {
        this.grid.forEach((row, rowIndex) => {
            row.forEach((node, colIndex) => {
                fn(node, rowIndex, colIndex);
            });
        });
    }

    reduce<TAcc>(
        fn: (acc: TAcc, data: T | undefined, row: number, col: number) => TAcc,
        initialValue: TAcc
    ) {
        let acc = initialValue;
        this.grid.forEach((row, rowIndex) => {
            row.forEach((node, colIndex) => {
                acc = fn(acc, node, rowIndex, colIndex);
            });
        });
        return acc;
    }

    find(
        fn: (data: T | undefined, row: number, col: number) => boolean
    ): T | undefined {
        for (const [iRow, row] of this.grid.entries()) {
            for (const [iCol, node] of row.entries()) {
                if (fn(node, iRow, iCol)) {
                    return node;
                }
            }
        }
        return undefined;
    }

    getOrthogonalNeighborsOf(row: number, col: number) {
        return Grid.orthogonalNeighbors.reduce<T[]>(
            (neighbors, [rowDiff, colDiff]) => {
                const node = this.getAt(row + rowDiff, col + colDiff);
                if (node) {
                    neighbors.push(node);
                }
                return neighbors;
            },
            []
        );
    }

    getAllNeighborsOf(row: number, col: number) {
        return Grid.allNeighbors.reduce<T[]>(
            (neighbors, [rowDiff, colDiff]) => {
                const node = this.getAt(row + rowDiff, col + colDiff);
                if (node) {
                    neighbors.push(node);
                }
                return neighbors;
            },
            []
        );
    }

    draw(drawFn?: (data: T | undefined) => string) {
        const padding = Math.max(4, this.height.toString().length + 1);

        console.log(`
${this.grid
    .map(
        (row, y) =>
            `${kleur.cyan(
                (y + this.minY).toString().padStart(padding, ' ')
            )} ${row
                .slice((this.minXUpdated ?? 0) > 0 ? this.minXUpdated : 0)
                .map(
                    (d, x) =>
                        (drawFn ?? this.drawFn)?.(d) ??
                        d?.toString?.() ??
                        this.blank
                )
                .join('')}`
    )
    .join('\n')}
`);
    }
}
