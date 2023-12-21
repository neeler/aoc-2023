import kleur from 'kleur';

export class Grid<T> {
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
        const width = Math.max(...arr.map((row) => row.length));
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

    filter(fn: (data: T, row: number, col: number) => boolean) {
        let filtered: T[] = [];
        this.grid.forEach((row, rowIndex) => {
            row.forEach((node, colIndex) => {
                if (node && fn(node, rowIndex, colIndex)) {
                    filtered.push(node);
                }
            });
        });
        return filtered;
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

    findCoords(
        fn: (data: T | undefined, row: number, col: number) => boolean
    ): { row: number; col: number } | undefined {
        for (const [iRow, row] of this.grid.entries()) {
            for (const [iCol, node] of row.entries()) {
                if (fn(node, iRow, iCol)) {
                    return {
                        row: iRow,
                        col: iCol,
                    };
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

    getRow(y: number) {
        return this.grid[y - this.minY] ?? [];
    }

    getColumn(x: number) {
        return this.grid.map((row) => row[x - this.minX]);
    }

    forEachRow(fn: (data: (T | undefined)[], rowIndex: number) => void) {
        this.grid.forEach((row, rowIndex) => {
            fn(row, rowIndex);
        });
    }

    mapRow<TMap>(fn: (data: (T | undefined)[], rowIndex: number) => TMap) {
        return this.grid.map((row, rowIndex) => fn(row, rowIndex));
    }

    toString(drawFn?: (data: T | undefined) => string) {
        const padding = Math.max(4, this.height.toString().length + 1);

        return this.grid
            .map(
                (row, y) =>
                    `${kleur.cyan(
                        (y + this.minY).toString().padStart(padding, ' ')
                    )} ${row
                        .slice(
                            (this.minXUpdated ?? 0) > 0 ? this.minXUpdated : 0
                        )
                        .map(
                            (d, x) =>
                                (drawFn ?? this.drawFn)?.(d) ??
                                d?.toString?.() ??
                                this.blank
                        )
                        .join('')}`
            )
            .join('\n');
    }

    get key() {
        return this.grid
            .map((row, y) =>
                row
                    .slice((this.minXUpdated ?? 0) > 0 ? this.minXUpdated : 0)
                    .map(
                        (d, x) =>
                            this.drawFn?.(d) ?? d?.toString?.() ?? this.blank
                    )
                    .join('')
            )
            .join('');
    }

    draw(drawFn?: (data: T | undefined) => string) {
        console.log(`
${this.toString(drawFn)}
`);
    }
}
