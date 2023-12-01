import { Puzzle } from './Puzzle';

export const puzzle1 = new Puzzle({
    day: 1,
    processFile: (fileData) => {
        const lines = fileData.trim().split('\n');
        return lines;
    },
    skipPart1: true,
    part1: (inputLines) => {
        const calibrationValues = inputLines.map((inputLine) => {
            const digits = inputLine
                .split('')
                .filter((s) => !Number.isNaN(parseInt(s, 10)));
            const firstDigit = digits[0];
            const lastDigit = digits[digits.length - 1];
            return parseInt(`${firstDigit}${lastDigit}`, 10);
        });
        return calibrationValues.reduce((sum, v) => sum + v, 0);
    },
    part2: (inputLines) => {
        const digitWords: Record<string, number> = {
            one: 1,
            two: 2,
            three: 3,
            four: 4,
            five: 5,
            six: 6,
            seven: 7,
            eight: 8,
            nine: 9,
        };
        const wordDigits = Object.keys(digitWords);

        const calibrationValues = inputLines.map((inputLine) => {
            const digits: number[] = [];
            for (let i = 0; i < inputLine.length; i++) {
                const matchingWord = wordDigits.find((word) =>
                    inputLine.slice(i).startsWith(word)
                );
                if (matchingWord) {
                    digits.push(digitWords[matchingWord]);
                } else {
                    const parsed = parseInt(inputLine[i], 10);
                    if (!Number.isNaN(parsed)) {
                        digits.push(parsed);
                    }
                }
            }
            const firstDigit = digits[0];
            const lastDigit = digits[digits.length - 1];
            return parseInt(`${firstDigit}${lastDigit}`, 10);
        });
        return calibrationValues.reduce((sum, v) => sum + v, 0);
    },
});
