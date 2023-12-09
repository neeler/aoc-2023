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
        function extrapolateForward(sequence: number[]) {
            if (sequence.length < 2) {
                throw new Error('Sequence must have at least 2 numbers');
            }
            const lastNumbers = [sequence[sequence.length - 1]!];
            let diffs = getDiffs(sequence);
            while (sum(diffs) !== 0) {
                lastNumbers.push(diffs[diffs.length - 1]!);
                diffs = getDiffs(diffs);
            }

            return sum(lastNumbers);
        }

        return sum(histories.map(extrapolateForward));
    },
    part2: (histories) => {
        function extrapolateBackward(sequence: number[]) {
            if (sequence.length < 2) {
                throw new Error('Sequence must have at least 2 numbers');
            }
            const firstNumbers = [sequence[0]!];
            let diffs = getDiffs(sequence);
            while (sum(diffs) !== 0) {
                firstNumbers.push(diffs[0]!);
                diffs = getDiffs(diffs);
            }

            return firstNumbers.reverse().reduce((delta, x) => x - delta, 0);
        }

        return sum(histories.map(extrapolateBackward));
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
