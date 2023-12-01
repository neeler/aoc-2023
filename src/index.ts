import { puzzle1 } from '~/puzzles';

async function start() {
    await puzzle1.run({
        example: true,
        mainProblem: false,
    });
}

start();
