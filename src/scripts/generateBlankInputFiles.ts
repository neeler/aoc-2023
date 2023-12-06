import { writeFileSync, existsSync } from 'fs';
import path from 'path';
import { analyzePuzzleFiles } from '~/scripts/analyzePuzzleFiles';
import { createDirIfNotExists } from '~/scripts/createDirIfNotExists';

const dataFolder = createDirIfNotExists('../../data');

const { lastPuzzleNumber } = analyzePuzzleFiles();

/** Generate blank puzzle files if they don't exist already **/
for (
    let puzzleNumber = 1;
    puzzleNumber < lastPuzzleNumber + 1;
    puzzleNumber++
) {
    const exampleFilePath = path.join(
        dataFolder,
        `puzzle${puzzleNumber}-example.txt`
    );
    const inputFilePath = path.join(
        dataFolder,
        `puzzle${puzzleNumber}-input.txt`
    );

    [exampleFilePath, inputFilePath].forEach((filePath) => {
        if (!existsSync(filePath)) {
            writeFileSync(filePath, '');
        }
    });
}
