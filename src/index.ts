import { puzzle1, puzzle2, puzzle3, puzzle4 } from '~/puzzles';

async function start() {
    // await puzzle1.run();
    // await puzzle2.run();
    // await puzzle3.run();
    await puzzle4.run({
        example: true,
        mainProblem: true,
    });
}

start();
