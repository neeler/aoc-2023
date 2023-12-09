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
            histories.map((history) => {
                const lastNumbers: number[] = [];
                forEachDiffLayer(history, (diffs) => {
                    const lastNumber = diffs[diffs.length - 1];
                    if (lastNumber !== undefined) {
                        lastNumbers.push(lastNumber);
                    }
                });
                return sum(lastNumbers);
            })
        );
    },
    part2: (histories) => {
        return sum(
            histories.map((history) => {
                const firstNumbers: number[] = [];
                forEachDiffLayer(history, (diffs) => {
                    const firstNumber = diffs[0];
                    if (firstNumber !== undefined) {
                        firstNumbers.push(firstNumber);
                    }
                });
                return firstNumbers
                    .reverse()
                    .reduce((delta, x) => x - delta, 0);
            })
        );
    },
});

function forEachDiffLayer(
    sequence: number[],
    callback: (diffs: number[]) => void
) {
    if (sequence.length < 2) {
        throw new Error('Sequence must have at least 2 numbers');
    }

    let previousSequence = sequence;
    callback(previousSequence);

    let diffs = getDiffs(sequence);

    while (diffs.some((n) => n !== 0)) {
        previousSequence = diffs;
        callback(previousSequence);

        diffs = getDiffs(diffs);
    }
}

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
