import { puzzle1, puzzle2 } from '~/puzzles';

async function start() {
    // await puzzle1.run();
    await puzzle2.run({
        example: true,
        mainProblem: true,
    });
}

start();
