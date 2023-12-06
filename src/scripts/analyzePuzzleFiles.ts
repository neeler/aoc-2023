import { readdirSync } from 'fs';
import { createDirIfNotExists } from '~/scripts/createDirIfNotExists';

const puzzleFolder = createDirIfNotExists('../puzzles');

/** Figure out how many puzzle solutions exist so far **/
export function analyzePuzzleFiles() {
    const existingPuzzleFiles = readdirSync(puzzleFolder);
    const existingPuzzleNumbers = existingPuzzleFiles
        .map((fileName) => parseInt(fileName.match(/\d+/)?.[0] ?? '', 10))
        .filter((n) => !isNaN(n))
        .sort((a, b) => b - a);
    const lastPuzzleNumber = existingPuzzleNumbers.length
        ? Math.max(...existingPuzzleNumbers)
        : 0;

    return {
        existingPuzzleFiles,
        existingPuzzleNumbers,
        lastPuzzleNumber,
        nextPuzzleNumber: lastPuzzleNumber + 1,
    };
}
