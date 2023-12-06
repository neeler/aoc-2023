import { existsSync, statSync, writeFileSync } from 'fs';
import kleur from 'kleur';
import path from 'path';
import { sessionKey, year } from '~/constants';
import { createDirIfNotExists } from '~/scripts/createDirIfNotExists';

export async function fetchPuzzleInput(
    day: number,
    {
        onFailure,
    }: {
        onFailure?: () => void;
    }
) {
    const dataFolder = createDirIfNotExists('../../data');

    if (!sessionKey) {
        console.log(kleur.red('AOC_SESSION_KEY not found in .env file!'));
        onFailure?.();
        return;
    }

    const filePath = path.join(dataFolder, `puzzle${day}-input.txt`);

    if (existsSync(filePath) && statSync(filePath).size > 0) {
        console.log(
            kleur.yellow(`Input for AoC ${year} day ${day} already fetched.`)
        );
        return;
    }

    const response = await fetch(
        `https://adventofcode.com/${year}/day/${day}/input`,
        {
            headers: {
                cookie: `session=${process.env.AOC_SESSION_KEY}`,
            },
        }
    );

    if (response.status !== 200) {
        if (response.status === 400 || response.status === 500) {
            console.log(
                kleur.red('INVALID SESSION KEY') +
                    `
Please make sure that the session key in the .env file is correct.
You can find your session key in the 'session' cookie at:
https://adventofcode.com
` +
                    kleur.bold(
                        `Restart the script after changing the .env file.
`
                    )
            );
        } else if (response.status > 500) {
            console.log(kleur.red('SERVER ERROR'));
        } else if (response.status === 404) {
            console.log(kleur.yellow('Challenge not yet available.'));
        } else {
            console.log(kleur.red('SOMETHING WENT WRONG'));
        }

        onFailure?.();
        return;
    }

    const fileData = await response.text();

    writeFileSync(filePath, fileData.replace(/\n$/, ''));

    console.log(kleur.green(`Input for AoC ${year} day ${day} saved!`));
}
