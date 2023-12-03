import { Puzzle } from './Puzzle';

export const puzzle1 = new Puzzle<string>({
    day: 1,
    parseLineByLine: true,
    parseInput: (line) => {
        return line;
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
                    const number = digitWords[matchingWord];
                    if (number) {
                        digits.push(number);
                    }
                } else {
                    const parsed = parseInt(inputLine[i] ?? '', 10);
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
