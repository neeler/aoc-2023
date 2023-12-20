import { writeFileSync } from 'fs';
import kleur from 'kleur';
import path from 'path';
import { SolutionTemplate } from '~/scripts/SolutionTemplate';
import { analyzePuzzleFiles } from '~/scripts/analyzePuzzleFiles';
import { createDirIfNotExists } from '~/scripts/createDirIfNotExists';
import { fetchPuzzleInput } from '~/scripts/fetchPuzzleInput';

async function setupNextPuzzle() {
    const dataFolder = createDirIfNotExists('../../data');
    const puzzleFolder = createDirIfNotExists('../puzzles');
    const srcFolder = createDirIfNotExists('..');

    /** Figure out next puzzle number **/
    const { nextPuzzleNumber } = analyzePuzzleFiles();

    /** Generate blank puzzle files **/
    console.log(
        kleur.cyan(`Generating blank example file for puzzle ${nextPuzzleNumber}:
- data/puzzle${nextPuzzleNumber}-example.txt
`)
    );
    writeFileSync(
        path.join(dataFolder, `puzzle${nextPuzzleNumber}-example.txt`),
        ''
    );
    await fetchPuzzleInput(nextPuzzleNumber, {
        onFailure: () => {
            console.log(
                kleur.cyan(
                    `Generating blank input file for puzzle ${nextPuzzleNumber}:
- data/puzzle${nextPuzzleNumber}-input.txt`
                )
            );
            writeFileSync(
                path.join(dataFolder, `puzzle${nextPuzzleNumber}-input.txt`),
                ''
            );
        },
    });

    console.log(
        kleur.cyan(
            `Generating solution template for puzzle ${nextPuzzleNumber}:
- src/puzzles/puzzle${nextPuzzleNumber}.ts
`
        )
    );
    writeFileSync(
        path.join(puzzleFolder, `puzzle${nextPuzzleNumber}.ts`),
        SolutionTemplate(nextPuzzleNumber)
    );
    writeFileSync(
        path.join(puzzleFolder, 'index.ts'),
        `${Array.from(
            { length: nextPuzzleNumber },
            (v, i) => `export { puzzle${i + 1} } from './puzzle${i + 1}';`
        ).join('\n')}
`
    );

    console.log(
        kleur.cyan(
            `Updating puzzle runner (src/index.ts) to add puzzle ${nextPuzzleNumber}.`
        )
    );
    writeFileSync(
        path.join(srcFolder, 'index.ts'),
        `import kleur from 'kleur';
import {
${Array.from(
    { length: nextPuzzleNumber },
    (v, i) => `    puzzle${i + 1},`
).join('\n')}
} from '~/puzzles';
import { Timer } from '~/util/Timer';

async function start() {    
    const timer = new Timer();

${Array.from(
    { length: nextPuzzleNumber - 1 },
    (v, i) => `    // await puzzle${i + 1}.run();`
).join('\n')}
    await puzzle${nextPuzzleNumber}.run({ 
        example: true, 
        mainProblem: false 
    });

    console.log(kleur.cyan(\`All puzzles ran in \${timer.time}.\`));
}

start();
`
    );
}

setupNextPuzzle();
