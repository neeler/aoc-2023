import { sum } from '~/util/arithmetic';
import { memoize } from '~/util/memoize';
import { Puzzle } from './Puzzle';

interface State {
    line: string;
    runs: number[];
}

const countArrangements = memoize<State, number>({
    key: ({ line, runs }) => `${line}:${runs}`,
    fn: ({ line, runs }): number => {
        // First handle all the base cases
        // Before we start recursing.

        if (line.length === 0) {
            // No characters left in line.

            if (runs.length === 0) {
                // No runs left to fill.
                // Valid
                return 1;
            }

            // Runs still left to fill.
            // Invalid
            return 0;
        }
        if (runs.length === 0) {
            // No runs left to fill.
            // As long as there aren't any damaged springs remaining,
            // this is a valid arrangement.

            for (const char of line) {
                if (char === '#') {
                    // Found a busted spring.
                    // Invalid
                    return 0;
                }
            }

            // No busted springs found.
            // Valid
            return 1;
        }

        // To reduce the number of recursive calls,
        // we can check if the line is long enough to fit the remaining runs.
        const minLength = sum([...runs]) + runs.length - 1;
        if (line.length < minLength) {
            return 0;
        }

        const firstChar = line[0]!;
        const charsAfterFirst = line.slice(1);

        if (firstChar === '.') {
            // If the first character is a working spring,
            // remove it and continue,
            // since it is irrelevant to this computation.
            return countArrangements({
                line: charsAfterFirst,
                runs,
            });
        }

        if (firstChar === '#') {
            // The first character is a busted spring

            const [firstRun, ...remainingRuns] = runs;
            if (!firstRun) {
                // No runs left to fill.
                // This shouldn't ever happen given our previous base cases
                // but just in case...
                // Invalid (because we have a busted spring)
                return 0;
            }
            if (line[firstRun] === '#') {
                // If the space after the first run is a busted spring,
                // this arrangement is invalid,
                // because we require a working spring to separate runs.
                return 0;
            }
            for (let i = 1; i < firstRun; i++) {
                if (line[i] === '.') {
                    // If there are any working springs in the first run,
                    // this arrangement is invalid.
                    return 0;
                }
            }

            // We can successfully fill the first run.
            // Remove the first run from the list of runs,
            // and continue with the rest of the line.
            return countArrangements({
                line: line.slice(firstRun + 1),
                runs: remainingRuns,
            });
        }

        // Otherwise, we must consider both possibilities:
        // - The first character is a busted spring
        // - The first character is a working spring (and we remove it)
        return (
            countArrangements({
                line: `#${charsAfterFirst}`,
                runs,
            }) +
            countArrangements({
                line: charsAfterFirst,
                runs,
            })
        );
    },
});

export const puzzle12 = new Puzzle({
    day: 12,
    parseInput: (fileData) => {
        const data = fileData.split('\n').filter((s) => s);
        const lines: string[] = [];
        const sizes: number[][] = [];
        data.forEach((row, iRow) => {
            const [springString = '', sizeString = ''] = row.split(' ');
            lines.push(springString.trim());
            sizes.push(
                sizeString
                    .split(',')
                    .filter((s) => s)
                    .map(Number)
            );
        });
        return { lines, sizes };
    },
    part1: ({ lines, sizes }) => {
        const arrangementsPerRow = lines.map((line, iRow) => {
            return countArrangements({
                line,
                runs: sizes[iRow] ?? [],
            });
        });

        return sum(arrangementsPerRow);
    },
    part2: ({ lines, sizes }) => {
        const arrangementsPerRow = lines.map((line, iRow) => {
            const foldFactor = 5;
            return countArrangements({
                line: Array(foldFactor).fill(line).join('?'),
                runs: Array.from({ length: foldFactor }, () => [
                    ...(sizes[iRow] ?? []),
                ]).flat(),
            });
        });

        return sum(arrangementsPerRow);
    },
});
