import { Point3D } from '~/types/Point3D';
import { FixedSizeArray } from '~/types/arrays';

export class BigIntVector3D {
    private readonly data: FixedSizeArray<bigint, 3>;

    constructor(x: number | bigint, y: number | bigint, z: number | bigint) {
        this.data = [BigInt(x), BigInt(y), BigInt(z)];
    }

    get x() {
        return this.data[0];
    }

    get y() {
        return this.data[1];
    }

    get z() {
        return this.data[2];
    }

    static fromPoint3D(point: Point3D) {
        return new BigIntVector3D(point.x, point.y, point.z);
    }

    toString() {
        return this.data.toString();
    }

    equals(other: BigIntVector3D) {
        return this.x === other.x && this.y === other.y && this.z === other.z;
    }

    add(other: BigIntVector3D) {
        return new BigIntVector3D(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z
        );
    }

    subtract(other: BigIntVector3D) {
        return new BigIntVector3D(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z
        );
    }

    multiply(scalar: number | bigint) {
        return new BigIntVector3D(
            this.x * BigInt(scalar),
            this.y * BigInt(scalar),
            this.z * BigInt(scalar)
        );
    }

    divideBy(scalar: number | bigint) {
        return new BigIntVector3D(
            this.x / BigInt(scalar),
            this.y / BigInt(scalar),
            this.z / BigInt(scalar)
        );
    }

    dot(other: BigIntVector3D) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    cross(other: BigIntVector3D) {
        return new BigIntVector3D(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }
}
