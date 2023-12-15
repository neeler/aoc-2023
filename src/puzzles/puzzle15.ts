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
        const boxes = Array.from(
            { length: 256 },
            () => new Map<string, number>()
        );
        steps.forEach((step) => {
            runHASHMAP(boxes, step);
        });
        return sum(
            boxes.map((box, iBox) => {
                return sum(
                    [...box.values()].map(
                        (focalLength, iLens) =>
                            (iBox + 1) * (iLens + 1) * focalLength
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

function runHASHMAP(boxes: Map<string, number>[], str: string) {
    const [, label = '', operator = '', focalLength = ''] =
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

    switch (operator) {
        case '=': {
            box.set(label, parseInt(focalLength, 10));
            break;
        }
        case '-': {
            box.delete(label);
            break;
        }
        default: {
            throw new Error(
                `Invalid operator "${operator}" for command "${str}"`
            );
        }
    }
}
