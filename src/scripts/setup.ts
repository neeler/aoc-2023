import { writeFileSync, existsSync, statSync } from 'fs';
import kleur from 'kleur';
import path from 'path';
import { analyzePuzzleFiles } from '~/scripts/analyzePuzzleFiles';
import { createDirIfNotExists } from '~/scripts/createDirIfNotExists';
import { fetchPuzzleInput } from '~/scripts/fetchPuzzleInput';

async function setupRepo() {
    const envFile = path.join(__dirname, '../../.env');

    if (!existsSync(envFile)) {
        console.log(kleur.cyan('Creating .env file.'));
        writeFileSync(
            envFile,
            `AOC_SESSION_KEY=
AOC_YEAR=${new Date().getFullYear()}
`
        );
    }

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
        if (!existsSync(exampleFilePath)) {
            console.log(
                kleur.cyan(
                    `Generating blank example input file for puzzle ${puzzleNumber}.`
                )
            );
            writeFileSync(exampleFilePath, '');
        }

        const inputFilePath = path.join(
            dataFolder,
            `puzzle${puzzleNumber}-input.txt`
        );
        if (!existsSync(inputFilePath) || statSync(inputFilePath).size === 0) {
            await fetchPuzzleInput(puzzleNumber, {
                onFailure: () => {
                    console.log(
                        kleur.cyan(
                            `Generating blank input file for puzzle ${puzzleNumber}.`
                        )
                    );
                    writeFileSync(inputFilePath, '');
                },
            });
        }
    }
}

setupRepo();
