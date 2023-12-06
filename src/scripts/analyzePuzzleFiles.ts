import { readdirSync, readFileSync } from 'fs';
import kleur from 'kleur';
import path from 'path';
import { SolutionTemplate } from '~/scripts/SolutionTemplate';
import { createDirIfNotExists } from '~/scripts/createDirIfNotExists';

/** Figure out how many puzzle solutions exist so far **/
export function analyzePuzzleFiles() {
    const puzzleFolder = createDirIfNotExists('../puzzles');

    const existingPuzzleFiles = readdirSync(puzzleFolder);
    const existingPuzzleNumbers = existingPuzzleFiles
        .filter((fileName) => {
            const contents = readFileSync(
                path.join(puzzleFolder, fileName),
                'utf-8'
            );
            const puzzleNumber = getPuzzleNumberFromFileName(fileName);
            return (
                !isNaN(puzzleNumber) &&
                contents !== SolutionTemplate(puzzleNumber)
            );
        })
        .map(getPuzzleNumberFromFileName)
        .sort((a, b) => b - a);
    const lastPuzzleNumber = existingPuzzleNumbers.length
        ? Math.max(...existingPuzzleNumbers)
        : 0;

    console.log(
        kleur.cyan(`
${existingPuzzleNumbers.length} existing puzzle solution files found.
`)
    );

    return {
        existingPuzzleFiles,
        existingPuzzleNumbers,
        lastPuzzleNumber,
        nextPuzzleNumber: lastPuzzleNumber + 1,
    };
}

function getPuzzleNumberFromFileName(fileName: string) {
    return parseInt(fileName.match(/\d+/)?.[0] ?? '', 10);
}
