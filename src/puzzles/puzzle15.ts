import { CustomSet } from '~/types/CustomSet';
import { sum } from '~/util/arithmetic';
import { Puzzle } from './Puzzle';

export const puzzle15 = new Puzzle({
    day: 15,
    parseInput: (fileData) => {
        return fileData.split(',').filter((s) => s);
    },
    part1: (steps) => {
        return sum(steps.map((s) => runHASH(s)));
    },
    part2: (steps) => {
        const boxes = Array.from({ length: 256 }, () => new Box());
        steps.forEach((step) => {
            runHASHMAP(boxes, step);
        });
        return sum(
            boxes.map((box, iBox) => {
                const lenses = box.values();
                return sum(
                    lenses.map(
                        (lens, iLens) =>
                            (iBox + 1) * (iLens + 1) * lens.focalLength
                    )
                );
            })
        );
    },
});

function runHASH(str: string) {
    let value = 0;

    const characters = str.split('');

    for (const character of characters) {
        const charCode = character.charCodeAt(0);
        value += charCode;
        value *= 17;
        value %= 256;
    }

    return value;
}

class Box extends CustomSet<Lens, string> {
    constructor() {
        super({
            getKey: (lens) => lens.label,
        });
    }
}

class Lens {
    readonly label: string;
    focalLength: number;

    constructor(config: { label: string; focalLength: number }) {
        this.label = config.label;
        this.focalLength = config.focalLength;
    }

    setFocalLength(focalLength: number) {
        this.focalLength = focalLength;
    }
}

function runHASHMAP(boxes: Box[], str: string) {
    const [, label = '', operator = '', flString = ''] =
        str.match(/([^-=]+)([=-])(\d+)?/) ?? [];

    const boxIndex = runHASH(label);
    if (Number.isNaN(boxIndex) || boxIndex < 0 || boxIndex > 255) {
        throw new Error(`Invalid box index ${boxIndex} for command "${str}"`);
    }

    const box = boxes[boxIndex];
    if (!box) {
        throw new Error(
            `No box found at index ${boxIndex} for command "${str}"`
        );
    }

    const existingLens = box.get(label);

    switch (operator) {
        case '=': {
            const focalLength = parseInt(flString, 10);
            if (existingLens) {
                existingLens.setFocalLength(focalLength);
            } else {
                box.add(
                    new Lens({
                        label,
                        focalLength,
                    })
                );
            }
            break;
        }
        case '-': {
            if (existingLens) {
                box.delete(existingLens);
            }
            break;
        }
        default: {
            throw new Error(
                `Invalid operator "${operator}" for command "${str}"`
            );
        }
    }
}
