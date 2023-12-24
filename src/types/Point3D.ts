import { CustomSet } from '~/types/CustomSet';

/**
 * Point in a 3-dimensional grid.
 */
export class Point3D {
    private readonly point: [number, number, number];

    constructor(x: number, y: number, z: number) {
        this.point = [x, y, z];
    }

    get x() {
        return this.point[0];
    }

    get y() {
        return this.point[1];
    }

    get z() {
        return this.point[2];
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
        maximumGridSize?: Point3D;
        /**
         * Optional set of neighbors to ignore.
         */
        ignorePoints?: Point3DSet;
    } = {}) {
        const indexes: Point3D[] = [];

        for (let dx = -1; dx < 2; dx++) {
            for (let dy = -1; dy < 2; dy++) {
                for (let dz = -1; dz < 2; dz++) {
                    if (dx || dy || dz) {
                        const newPoint = new Point3D(
                            this.x + dx,
                            this.y + dy,
                            this.z + dz
                        );
                        const isWithinBounds =
                            newPoint.x >= 0 &&
                            newPoint.y >= 0 &&
                            newPoint.z >= 0 &&
                            (!maximumGridSize ||
                                (newPoint.x < maximumGridSize.x &&
                                    newPoint.y < maximumGridSize.y &&
                                    newPoint.z < maximumGridSize.z));
                        if (
                            isWithinBounds &&
                            (!ignorePoints || !ignorePoints.has(newPoint))
                        ) {
                            indexes.push(newPoint);
                        }
                    }
                }
            }
        }

        return indexes;
    }

    equals(other: Point3D) {
        return this.x === other.x && this.y === other.y && this.z === other.z;
    }

    add(other: Point3D) {
        return new Point3D(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z
        );
    }

    subtract(other: Point3D) {
        return new Point3D(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z
        );
    }

    multiply(scalar: number) {
        return new Point3D(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    divideBy(scalar: number) {
        return new Point3D(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    dot(other: Point3D) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    cross(other: Point3D) {
        return new Point3D(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }
}

export class Point3DSet extends CustomSet<Point3D, string> {
    constructor() {
        super({
            getKey: (point) => point.toString(),
        });
    }
}
