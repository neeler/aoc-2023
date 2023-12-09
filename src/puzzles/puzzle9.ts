import { sum } from '~/util/arithmetic';
import { Puzzle } from './Puzzle';

export const puzzle9 = new Puzzle({
    day: 9,
    parseInput: (fileData) => {
        return fileData
            .split('\n')
            .filter((s) => s)
            .map((line) => line.split(/\s+/).map(Number));
    },
    part1: (histories) => {
        return sum(
            histories.map((history) =>
                extrapolate({
                    sequence: history,
                    getNext: (seq) => seq[seq.length - 1],
                    accumulate: sum,
                })
            )
        );
    },
    part2: (histories) => {
        return sum(
            histories.map((history) =>
                extrapolate({
                    sequence: history,
                    getNext: (seq) => seq[0],
                    accumulate: (numbers) =>
                        numbers.reverse().reduce((delta, x) => x - delta, 0),
                })
            )
        );
    },
});

function getDiffs(sequence: number[]) {
    const diffs: number[] = [];
    if (sequence.length < 2) {
        return diffs;
    }
    for (let i = 1; i < sequence.length; i++) {
        diffs.push(sequence[i]! - sequence[i - 1]!);
    }
    return diffs;
}

function extrapolate({
    sequence,
    getNext,
    accumulate,
    numbersSoFar = [],
}: {
    sequence: number[];
    getNext: (seq: number[]) => number | undefined;
    accumulate: (numbers: number[]) => number;
    numbersSoFar?: number[];
}): number {
    const nextNumber = getNext(sequence);
    if (nextNumber !== undefined) {
        numbersSoFar.push(nextNumber);
    }
    if (sequence.every((n) => n === 0)) {
        return accumulate(numbersSoFar);
    }
    return extrapolate({
        sequence: getDiffs(sequence),
        getNext,
        accumulate,
        numbersSoFar,
    });
}
