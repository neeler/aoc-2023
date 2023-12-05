import { Puzzle } from './Puzzle';

interface Seed {
    seed: number;
    soil: number;
    fertilizer: number;
    water: number;
    light: number;
    temperature: number;
    humidity: number;
    location: number;
}
const orderedKeys = [
    'soil',
    'fertilizer',
    'water',
    'light',
    'temperature',
    'humidity',
    'location',
] as const;

type Range = [
    /** start */
    number,
    /** count */
    number
];

type MapGroup = [
    /** destination start */
    number,
    /** source start */
    number,
    /** count */
    number
];

export const puzzle5 = new Puzzle({
    day: 5,
    parseInput: (fileData) => {
        const [, seedString = '', ...mapStrings] =
            fileData
                .replace(/\n/g, ' ')
                .match(
                    /seeds:([\s\d]*)seed-to-soil map:([\s\d]*)soil-to-fertilizer map:([\s\d]*)fertilizer-to-water map:([\s\d]*)water-to-light map:([\s\d]*)light-to-temperature map:([\s\d]*)temperature-to-humidity map:([\s\d]*)humidity-to-location map:([\s\d]*)/
                ) ?? [];

        const orderedMapGroups = parseMapStrings(mapStrings);

        return {
            seedString,
            orderedMapGroups,
        };
    },
    part1: ({ seedString, orderedMapGroups }) => {
        const seeds: Seed[] = seedString
            .trim()
            .split(/\s+/)
            .map((s) => parseInt(s, 10))
            .map((seed) => ({
                seed,
                soil: seed,
                fertilizer: seed,
                water: seed,
                light: seed,
                temperature: seed,
                humidity: seed,
                location: seed,
            }));

        let currentNumbers = seeds.map((seed) => seed.seed);

        orderedMapGroups.forEach((mapGroups, iMap) => {
            const newNumbers = currentNumbers.map((number) => {
                for (const [
                    destinationStart,
                    sourceStart,
                    count,
                ] of mapGroups) {
                    if (number < sourceStart) {
                        return number;
                    }
                    if (sourceStart <= number && number < sourceStart + count) {
                        return destinationStart + (number - sourceStart);
                    }
                }

                return number;
            });

            // Save values to seed objects
            const key = orderedKeys[iMap]!;
            newNumbers.forEach((number, iNumber) => {
                const seed = seeds[iNumber]!;
                seed[key] = number;
            });

            currentNumbers = newNumbers;
        });

        return Math.min(...seeds.map((seed) => seed.location));
    },
    part2: ({ seedString, orderedMapGroups }) => {
        const seedNumbers = seedString
            .trim()
            .split(/\s+/)
            .map((s) => parseInt(s, 10));

        // Group numbers into groups of 2
        const seedRanges: Range[] = [];
        for (let i = 0; i < seedNumbers.length; i += 2) {
            seedRanges.push(seedNumbers.slice(i, i + 2) as Range);
        }

        let currentRanges: Range[] = seedRanges;

        // Map each range through all map levels
        orderedMapGroups.forEach((mapGroups) => {
            currentRanges = currentRanges.reduce<Range[]>(
                (newRanges, currentRange) => {
                    newRanges.push(...mapRange(currentRange, mapGroups));
                    return newRanges;
                },
                []
            );
        });

        return Math.min(...currentRanges.map(([iStart]) => iStart));
    },
});

function parseMapStrings(mapStrings: string[]) {
    return mapStrings.map((mapString) => {
        const numbers = mapString
            .trim()
            .split(/\s/g)
            .map((s) => parseInt(s, 10));

        // Group numbers into groups of 3
        const mapGroups: MapGroup[] = [];
        for (let i = 0; i < numbers.length; i += 3) {
            mapGroups.push(numbers.slice(i, i + 3) as MapGroup);
        }

        // Sort groups by sourceStart
        mapGroups.sort((a, b) => a[1] - b[1]);

        return mapGroups;
    });
}

function mapRange(inputRange: Range, mapGroups: MapGroup[]): Range[] {
    let [firstNumber, nRemaining] = inputRange;

    const newRanges: Range[] = [];

    for (const [destinationStart, sourceStart, nInMapRange] of mapGroups) {
        const lastInMapRange = sourceStart + nInMapRange - 1;
        let lastNumber = firstNumber + nRemaining - 1;
        const rangeDiff = destinationStart - sourceStart;

        if (nRemaining === 0) {
            return newRanges;
        }

        // Whole range is before first map range
        // So no mapping is needed
        if (lastNumber < sourceStart) {
            newRanges.push([firstNumber, nRemaining]);
            return newRanges;
        }

        const nBeforeMapRange = sourceStart - firstNumber;

        // There are some numbers before map range
        if (nBeforeMapRange > 0) {
            newRanges.push([firstNumber, nBeforeMapRange]);

            firstNumber += nBeforeMapRange;
            nRemaining -= nBeforeMapRange;

            if (nRemaining === 0) {
                return newRanges;
            }
        }

        // Last number is in map range
        if (lastNumber <= lastInMapRange) {
            newRanges.push([firstNumber + rangeDiff, nRemaining]);
            return newRanges;
        }

        // Last number is after map range
        // But first number still could be in map range

        // First number is in map range
        if (firstNumber <= lastInMapRange) {
            const nInThisRange = sourceStart + nInMapRange - firstNumber;
            newRanges.push([firstNumber + rangeDiff, nInThisRange]);
            firstNumber += nInThisRange;
            nRemaining -= nInThisRange;
        }
    }

    // all remaining numbers are after map range
    newRanges.push([firstNumber, nRemaining]);
    return newRanges;
}
