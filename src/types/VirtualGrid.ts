import kleur from 'kleur';
import { Grid } from '~/types/Grid';

export class VirtualGrid<T> {
    private readonly grid = new Map<number, Map<number, T>>();
    minX = Infinity;
    minY = Infinity;
    maxX = -Infinity;
    maxY = -Infinity;
    private readonly getBlank?: (row: number, col: number) => T;

    constructor({ getBlank }: { getBlank?: (row: number, col: number) => T }) {
        this.getBlank = getBlank;
    }

    getAt(rowIndex: number, colIndex: number) {
        const row = this.grid.get(rowIndex) ?? new Map<number, T>();

        this.grid.set(rowIndex, row);

        const existingItem = row.get(colIndex);

        if (existingItem) {
            return existingItem;
        }

        const isOutOfBounds =
            colIndex < this.minX ||
            colIndex > this.maxX ||
            rowIndex < this.minY ||
            rowIndex > this.maxY;

        if (isOutOfBounds) {
            return undefined;
        }

        const blank = this.getBlank?.(rowIndex, colIndex);
        if (!blank) {
            return undefined;
        }

        row.set(colIndex, blank);
        return blank;
    }

    setAt(rowIndex: number, colIndex: number, value: T) {
        const row = this.grid.get(rowIndex) ?? new Map<number, T>();

        this.grid.set(rowIndex, row);
        row.set(colIndex, value);

        this.minX = Math.min(this.minX, colIndex);
        this.minY = Math.min(this.minY, rowIndex);
        this.maxX = Math.max(this.maxX, colIndex);
        this.maxY = Math.max(this.maxY, rowIndex);
    }

    get width() {
        return this.maxX - this.minX + 1;
    }

    get height() {
        return this.maxY - this.minY + 1;
    }

    forEach(fn: (data: T | undefined, row: number, col: number) => void) {
        for (let rowIndex = this.minY; rowIndex <= this.maxY; rowIndex += 1) {
            for (
                let colIndex = this.minX;
                colIndex <= this.maxX;
                colIndex += 1
            ) {
                fn(this.getAt(rowIndex, colIndex), rowIndex, colIndex);
            }
        }
    }

    reduce<TAcc>(
        fn: (acc: TAcc, data: T | undefined, row: number, col: number) => TAcc,
        initialValue: TAcc
    ) {
        let acc = initialValue;
        for (let rowIndex = this.minY; rowIndex <= this.maxY; rowIndex += 1) {
            for (
                let colIndex = this.minX;
                colIndex <= this.maxX;
                colIndex += 1
            ) {
                acc = fn(
                    acc,
                    this.getAt(rowIndex, colIndex),
                    rowIndex,
                    colIndex
                );
            }
        }
        return acc;
    }

    filter(fn: (data: T, row: number, col: number) => boolean) {
        let filtered: T[] = [];

        for (let rowIndex = this.minY; rowIndex <= this.maxY; rowIndex += 1) {
            for (
                let colIndex = this.minX;
                colIndex <= this.maxX;
                colIndex += 1
            ) {
                const node = this.getAt(rowIndex, colIndex);
                if (node && fn(node, rowIndex, colIndex)) {
                    filtered.push(node);
                }
            }
        }
        return filtered;
    }

    find(
        fn: (data: T | undefined, row: number, col: number) => boolean
    ): T | undefined {
        for (let rowIndex = this.minY; rowIndex <= this.maxY; rowIndex += 1) {
            for (
                let colIndex = this.minX;
                colIndex <= this.maxX;
                colIndex += 1
            ) {
                const node = this.getAt(rowIndex, colIndex);
                if (fn(node, rowIndex, colIndex)) {
                    return node;
                }
            }
        }

        return undefined;
    }

    getOrthogonalNeighborsOf(row: number, col: number) {
        return Grid.orthogonalNeighbors.reduce<T[]>(
            (neighbors, [rowDiff, colDiff]) => {
                const rowIndex = row + rowDiff;
                const colIndex = col + colDiff;
                const node = this.getAt(rowIndex, colIndex);
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
                const rowIndex = row + rowDiff;
                const colIndex = col + colDiff;
                const node = this.getAt(rowIndex, colIndex);
                if (node) {
                    neighbors.push(node);
                }
                return neighbors;
            },
            []
        );
    }

    toArray() {
        return Array.from({ length: this.height }, (_, y) =>
            this.getRow(y + this.minY)
        );
    }

    getRow(rowIndex: number) {
        return Array.from({ length: this.width }, (_, x) => {
            const colIndex = x + this.minX;
            return this.getAt(rowIndex, colIndex);
        });
    }

    getColumn(colIndex: number) {
        return Array.from({ length: this.height }, (_, y) => {
            const rowIndex = y + this.minY;
            return this.getAt(rowIndex, colIndex);
        });
    }

    toString({
        drawFn,
        indexes = true,
    }: {
        drawFn?: (data: T | undefined) => string;
        indexes?: boolean;
    } = {}) {
        const padding = Math.max(4, this.height.toString().length + 1);

        return Array.from({ length: this.height }, (_, y) => {
            const rowIndex = y + this.minY;
            return `${
                indexes
                    ? `${kleur.cyan(
                          (rowIndex + this.minY)
                              .toString()
                              .padStart(padding, ' ')
                      )} `
                    : ''
            }${Array.from({ length: this.width }, (_, x) => {
                const colIndex = x + this.minX;
                const node = this.getAt(rowIndex, colIndex);
                return drawFn?.(node) ?? node?.toString();
            }).join('')}`;
        }).join('\n');
    }

    draw(drawFn?: (data: T | undefined) => string) {
        console.log(`
${this.toString({ drawFn })}
`);
    }

    reset() {
        this.grid.clear();
        this.minX = Infinity;
        this.minY = Infinity;
        this.maxX = -Infinity;
        this.maxY = -Infinity;
    }
}
