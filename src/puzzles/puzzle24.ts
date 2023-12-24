import { BigIntVector3D } from '~/types/BigIntVector3D';
import { Point3D } from '~/types/Point3D';
import { FixedSizeArray } from '~/types/arrays';
import { Puzzle } from './Puzzle';

export const puzzle24 = new Puzzle({
    day: 24,
    parseInput: (fileData) => {
        return fileData
            .split('\n')
            .filter((s) => s)
            .map((s, index) => {
                const [position = '', velocity = ''] = s.split('@');
                return new Projectile({
                    id: index.toString(),
                    position: stringToPoint(position),
                    velocity: stringToPoint(velocity),
                });
            });
    },
    part1: (stones) => {
        const intersections = new Set<string>();
        const considered = new Set<string>();
        stones.forEach((stone) => {
            stones.forEach((otherStone) => {
                const intersectionId = [stone.id, otherStone.id]
                    .sort()
                    .join(',');
                if (considered.has(intersectionId)) {
                    return;
                }
                considered.add(intersectionId);
                if (stone.id !== otherStone.id) {
                    if (
                        stone.willIntersectXY({
                            other: otherStone,
                            bounds: {
                                min: 200000000000000,
                                max: 400000000000000,
                            },
                        })
                    ) {
                        intersections.add(intersectionId);
                    }
                }
            });
        });
        return intersections.size;
    },
    /**
     * [!NOTE] My puzzle input required BigInts to solve.
     * The normal vector calculations were too large for regular numbers.
     */
    part2: async (stones) => {
        const nStonesNeeded = 4;

        if (stones.length < nStonesNeeded) {
            throw new Error('Invalid puzzle input');
        }

        const relevantStones = stones.slice(0, nStonesNeeded) as FixedSizeArray<
            Projectile,
            typeof nStonesNeeded
        >;

        /**
         * Take the first four hailstones.
         * Consider hailstones 2, 3, and 4
         * from the frame of reference of hailstone 1.
         *
         * We know that since they intersect,
         * the rock must pass through the origin (0,0,0)
         * of the frame of reference of hailstone 1.
         *
         * In this frame of reference, hailstone 2's path
         * forms a line. Take two points on this line.
         * These two points, along with the origin,
         * form a plane.
         * The rock must pass through this plane.
         */

        // First hailstone
        const [stone1] = relevantStones;

        // Other three hailstones in the frame of reference of the first hailstone
        const stone2 = relevantStones[1].toReferenceFrame(stone1);
        const stone3 = relevantStones[2].toReferenceFrame(stone1);
        const stone4 = relevantStones[3].toReferenceFrame(stone1);

        const pointsOnPlane: FixedSizeArray<BigIntVector3D, 3> = [
            new BigIntVector3D(0, 0, 0),
            BigIntVector3D.fromPoint3D(stone2.position),
            stone2.getBigIntAt(1),
        ];

        const vectorA = pointsOnPlane[1].subtract(pointsOnPlane[0]);
        const vectorB = pointsOnPlane[2].subtract(pointsOnPlane[0]);
        const normalVector = vectorA.cross(vectorB);

        /**
         * Plane equation:
         * ax + by + cz + d = 0
         * where
         *  a, b, c are the components of the normal vector
         *  x, y, z are the components of the first point (origin)
         *  d is 0 since the plane passes through the origin
         *
         *  Calculate points of intersection of the third and fourth hailstones
         *  with the plane.
         *
         *  First consider the third hailstone.
         *  We know that the hailstone's path forms a line.
         *  We know that the line must pass through the plane.
         *  We have the parametric equation of the line:
         *
         *  x = x0 + dx * t
         *  y = y0 + dy * t
         *  z = z0 + dz * t
         *
         *  so we can plug these into the equation of the plane:
         *  a(x0 + dx * t) + b(y0 + dy * t) + c(z0 + dz * t) = 0
         *
         *  and solve for t:
         *  t = -(ax0 + by0 + cz0) / (adx + bdy + cdz)
         */

        const t3 =
            -normalVector.dot(BigIntVector3D.fromPoint3D(stone3.position)) /
            normalVector.dot(BigIntVector3D.fromPoint3D(stone3.velocity));
        const t4 =
            -normalVector.dot(BigIntVector3D.fromPoint3D(stone4.position)) /
            normalVector.dot(BigIntVector3D.fromPoint3D(stone4.velocity));

        /**
         * Now we can calculate the intersection points
         * of the third and fourth hailstones with the plane.
         */

        const intersection3 = stone3
            .getBigIntAt(t3)
            .add(BigIntVector3D.fromPoint3D(stone1.position));
        const intersection4 = stone4
            .getBigIntAt(t4)
            .add(BigIntVector3D.fromPoint3D(stone1.position));

        /**
         * Now we have two points on the line of the rock's path.
         */

        const rockVelocity = intersection4
            .subtract(intersection3)
            .divideBy(t4 - t3);
        const rockOrigin = intersection3.subtract(rockVelocity.multiply(t3));

        return rockOrigin.x + rockOrigin.y + rockOrigin.z;
    },
});

class Projectile {
    readonly id: string;
    readonly position: Point3D;
    readonly velocity: Point3D;

    constructor({
        id,
        position,
        velocity,
    }: {
        id: string;
        position: Point3D;
        velocity: Point3D;
    }) {
        this.id = id;
        this.position = position;
        this.velocity = velocity;
    }

    toString() {
        return `${this.id} @ (${this.position}) + (${this.velocity})t`;
    }

    static fromTwoProjectiles({
        id,
        projectile1,
        projectile2,
        t1,
        t2,
    }: {
        id: string;
        projectile1: Projectile;
        projectile2: Projectile;
        t1: number;
        t2: number;
    }) {
        const firstPosition = projectile1.getAt(t1);
        const nextPosition = projectile2.getAt(t2);

        const velocity = nextPosition
            .subtract(firstPosition)
            .multiply(1 / (t2 - t1));

        const startingPoint = firstPosition.subtract(velocity.multiply(t1));

        return new Projectile({
            id,
            position: startingPoint,
            velocity,
        });
    }

    toReferenceFrame(other: Projectile): Projectile {
        return new Projectile({
            id: `${this.id}+${other.id}`,
            position: this.position.subtract(other.position),
            velocity: this.velocity.subtract(other.velocity),
        });
    }

    getAt(t: number): Point3D {
        return this.position.add(this.velocity.multiply(t));
    }

    getBigIntAt(t: number | bigint): BigIntVector3D {
        return BigIntVector3D.fromPoint3D(this.position).add(
            BigIntVector3D.fromPoint3D(this.velocity).multiply(t)
        );
    }

    getIntersectionXY(other: Projectile) {
        // y = mx + w
        // ax + by + c = 0
        // -mx + y - w = 0
        // a = -m
        // b = 1
        // c = -w

        const m1 = this.velocity.y / this.velocity.x;
        const w1 = this.position.y - m1 * this.position.x;
        const a1 = -m1;
        const b1 = 1;
        const c1 = -w1;

        const m2 = other.velocity.y / other.velocity.x;
        const w2 = other.position.y - m2 * other.position.x;
        const a2 = -m2;
        const b2 = 1;
        const c2 = -w2;

        /**
         * Calculate intersection point
         */
        const intersectionAxis1 = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1);
        const intersectionAxis2 = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1);

        if (
            Number.isNaN(intersectionAxis1) ||
            Number.isNaN(intersectionAxis2) ||
            Math.abs(intersectionAxis1) === Infinity ||
            Math.abs(intersectionAxis2) === Infinity
        ) {
            return null;
        }

        const t1 = (intersectionAxis1 - this.position.x) / this.velocity.x;
        const t2 = (intersectionAxis1 - other.position.x) / other.velocity.x;

        if (t1 < 0 || t2 < 0) {
            return null;
        }

        return {
            x: intersectionAxis1,
            y: intersectionAxis2,
            t1,
            t2,
        };
    }

    willIntersectXY({
        other,
        bounds,
    }: {
        other: Projectile;
        bounds: {
            min: number;
            max: number;
        };
    }): boolean {
        const intersection = this.getIntersectionXY(other);
        if (!intersection) {
            return false;
        }

        return !(
            intersection.x < bounds.min ||
            intersection.x > bounds.max ||
            intersection.y < bounds.min ||
            intersection.y > bounds.max
        );
    }
}

function stringToPoint(s: string) {
    const [x, y, z] = s.split(/\s*,\s*/).map((s) => parseInt(s.trim(), 10));
    if (!x || !y || !z || isNaN(x) || isNaN(y) || isNaN(z)) {
        throw new Error(`Invalid point string: ${s}`);
    }
    return new Point3D(x, y, z);
}
