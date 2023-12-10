import { CustomSet } from '~/types/CustomSet';

/**
 * Point in a 2-dimensional grid.
 */
export class Point {
    private readonly point: [number, number];

    constructor(x: number, y: number) {
        this.point = [x, y];
    }

    get x() {
        return this.point[0];
    }

    get col() {
        return this.x;
    }

    get y() {
        return this.point[1];
    }

    get row() {
        return this.y;
    }

    toString() {
        return this.point.toString();
    }

    /**
     * Returns neighboring points in the grid.
     */
    neighbors({
        maximumGridSize,
        ignorePoints,
    }: {
        /**
         * Optional maximum grid size.
         * Ignores neighbors beyond bounds.
         */
        maximumGridSize?: Point;
        /**
         * Optional set of neighbors to ignore.
         */
        ignorePoints?: PointSet;
    } = {}) {
        const indexes: Point[] = [];

        for (let dx = -1; dx < 2; dx++) {
            for (let dy = -1; dy < 2; dy++) {
                if (dx || dy) {
                    const newPoint = new Point(this.x + dx, this.y + dy);
                    const isWithinBounds =
                        newPoint.x >= 0 &&
                        newPoint.y >= 0 &&
                        (!maximumGridSize ||
                            (newPoint.x < maximumGridSize.x &&
                                newPoint.y < maximumGridSize.y));
                    if (
                        isWithinBounds &&
                        (!ignorePoints || !ignorePoints.has(newPoint))
                    ) {
                        indexes.push(newPoint);
                    }
                }
            }
        }

        return indexes;
    }
}

export class PointSet extends CustomSet<Point, string> {
    constructor() {
        super({
            getKey: (point) => point.toString(),
        });
    }
}
