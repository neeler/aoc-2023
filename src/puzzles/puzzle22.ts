import { Point3D } from '~/types/Point3D';
import { PriorityQueue } from '~/types/PriorityQueue';
import { Queue } from '~/types/Queue';
import { Puzzle } from './Puzzle';

export const puzzle22 = new Puzzle({
    day: 22,
    parseInput: (fileData) => {
        return new SkyMap(
            fileData
                .split('\n')
                .filter((s) => s)
                .map((s, index) => {
                    const [start = '', end = ''] = s.split('~');
                    return new Brick({
                        id: index,
                        start,
                        end,
                    });
                })
        );
    },
    part1: (skyMap) => {
        /**
         * Count the number of bricks that are not solely supporting any other brick.
         */
        return skyMap.bricks.reduce((nSafeToDestroy, brick) => {
            if (skyMap.getDependentBricks(brick).length === 0) {
                return nSafeToDestroy + 1;
            }
            return nSafeToDestroy;
        }, 0);
    },
    part2: (skyMap) => {
        /**
         * Count the number of bricks that fall in a chain reaction
         * when the brick at the given index is removed.
         * Sum for all bricks.
         */
        return skyMap.bricks.reduce((chainSum, brick) => {
            const bricksFallen = new Set<Brick>();

            const queue = new Queue<Brick>();
            queue.add(brick);

            queue.process((brick) => {
                /**
                 * Get all the dependent bricks of this brick
                 * taking into account the bricks that have already fallen
                 * in this chain reaction
                 */
                const dependentBricks = skyMap.getDependentBricks(
                    brick,
                    bricksFallen
                );
                for (const dependentBrick of dependentBricks) {
                    /**
                     * Add the brick to the list of bricks that have fallen
                     * and add it to the queue to check its dependents
                     */
                    bricksFallen.add(dependentBrick);
                    queue.add(dependentBrick);
                }
            });

            return chainSum + bricksFallen.size;
        }, 0);
    },
});

/**
 * A map of all the bricks in the sky
 */
class SkyMap {
    readonly bricks: Brick[];
    readonly brickLocations = new Map<string, Brick>();
    readonly bricksAbove = new Map<Brick, Set<Brick>>();
    readonly bricksBelow = new Map<Brick, Set<Brick>>();

    constructor(bricks: Brick[]) {
        this.bricks = bricks;
        bricks.forEach((brick) => this.cacheBrickLocations(brick));
        this.settle();
    }

    /**
     * Get all the bricks that are above the given brick
     * and are not supported by any other brick,
     * allowing for an optional input set of bricks that have already fallen
     */
    getDependentBricks(brick: Brick, bricksFallen?: Set<Brick>): Brick[] {
        const dependentBricks: Brick[] = [];
        const bricksAbove = this.bricksAbove.get(brick);

        if (bricksAbove) {
            for (const brickAbove of bricksAbove) {
                const bricksBelow = this.bricksBelow.get(brickAbove)!;

                /**
                 * Count the number of support bricks below this brick
                 * that have not fallen
                 * not including the brick we are checking
                 */
                let nSupports = 0;
                for (const brickBelow of bricksBelow) {
                    if (
                        brickBelow !== brick &&
                        !bricksFallen?.has(brickBelow)
                    ) {
                        nSupports++;
                    }
                }

                if (nSupports === 0) {
                    dependentBricks.push(brickAbove);
                }
            }
        }
        return dependentBricks;
    }

    /**
     * Update the given brick's location
     */
    private moveDown(brick: Brick) {
        brick.points.forEach((point) => {
            const key = point.toString();
            this.brickLocations.delete(key);
        });
        brick.moveDown();
        this.cacheBrickLocations(brick);
    }

    /**
     * Move all the bricks down as far as they can go
     */
    private settle() {
        /**
         * Use a priority queue to move the bricks down
         * in order of their minimum z value
         */
        const bricksInMotion = new PriorityQueue<Brick>({
            compare: (a, b) => a.minZ - b.minZ,
        });

        /**
         * Add all the bricks to the queue
         */
        this.bricks.forEach((brick) => bricksInMotion.add(brick));

        bricksInMotion.process((brick) => {
            /**
             * If the brick can't fall, skip it
             */
            if (!this.canFall(brick)) {
                return;
            }

            /**
             * Store the current bricks above this brick
             * so we can add them back to the queue later
             * in case they can move down further
             */
            const bricksAboveThisBrick = this.getBricksAbove(brick);

            /**
             * Move the brick down
             */
            this.moveDown(brick);

            /**
             * Add this brick and the bricks above it
             * back into the queue
             * in case they can move down further
             */
            bricksInMotion.add(brick);
            bricksAboveThisBrick.forEach((brickAbove) => {
                bricksInMotion.add(brickAbove);
            });
        });

        /**
         * Calculate the neighbors of each brick
         * and save them in a map
         */
        for (let brick of this.bricks) {
            this.bricksAbove.set(brick, new Set<Brick>());
            this.bricksBelow.set(brick, new Set<Brick>());
        }
        for (let brick of this.bricks) {
            const bricksAboveThisBrick = this.getBricksAbove(brick);

            bricksAboveThisBrick.forEach((brickAbove) => {
                this.bricksAbove.get(brick)!.add(brickAbove);
                this.bricksBelow.get(brickAbove)!.add(brick);
            });
        }
    }

    /**
     * Check if the given brick can fall
     */
    private canFall(brick: Brick): boolean {
        return brick.points.every((point) => {
            /**
             * If the brick is already on the ground, it can't fall
             */
            if (point.z - 1 <= 0) {
                return false;
            }

            const keyOfPointBelow = new Point3D(
                point.x,
                point.y,
                point.z - 1
            ).toString();

            /**
             * If there is no brick below, it can fall
             */
            return (
                !this.brickLocations.has(keyOfPointBelow) ||
                this.brickLocations.get(keyOfPointBelow) === brick
            );
        });
    }

    /**
     * Get all the bricks that are above the given brick
     */
    private getBricksAbove(brick: Brick): Brick[] {
        const bricksAboveThisBrick: Brick[] = [];

        brick.points.forEach((point) => {
            const keyOfPointAbove = new Point3D(
                point.x,
                point.y,
                point.z + 1
            ).toString();
            if (this.brickLocations.has(keyOfPointAbove)) {
                const otherBrick = this.brickLocations.get(keyOfPointAbove);
                if (otherBrick && otherBrick !== brick) {
                    bricksAboveThisBrick.push(otherBrick);
                }
            }
        });

        return bricksAboveThisBrick;
    }

    /**
     * Cache the locations of each point in the given brick
     */
    private cacheBrickLocations(brick: Brick) {
        brick.points.forEach((point) => {
            const key = point.toString();
            this.brickLocations.set(key, brick);
        });
    }
}

/**
 * A brick in the sky
 */
class Brick {
    readonly id: number;
    readonly name: string;
    start: Point3D;
    end: Point3D;
    points: Point3D[];
    minZ = Infinity;

    constructor({
        id,
        start,
        end,
    }: {
        id: number;
        start: string;
        end: string;
    }) {
        this.id = id;
        this.name = String.fromCharCode(65 + this.id);

        const [xStart = '', yStart = '', zStart = ''] = start.split(',');
        this.start = new Point3D(
            Number(xStart),
            Number(yStart),
            Number(zStart)
        );

        const [xEnd = '', yEnd = '', zEnd = ''] = end.split(',');
        this.end = new Point3D(Number(xEnd), Number(yEnd), Number(zEnd));

        this.points = [];
        for (let x = this.start.x; x <= this.end.x; x++) {
            for (let y = this.start.y; y <= this.end.y; y++) {
                for (let z = this.start.z; z <= this.end.z; z++) {
                    const point = new Point3D(x, y, z);
                    this.points.push(point);
                    this.minZ = Math.min(this.minZ, point.z);
                }
            }
        }
    }

    moveDown() {
        this.start = new Point3D(this.start.x, this.start.y, this.start.z - 1);
        this.end = new Point3D(this.end.x, this.end.y, this.end.z - 1);
        this.points = this.points.map((point) => {
            return new Point3D(point.x, point.y, point.z - 1);
        });
        this.minZ--;
    }
}
