import {
    puzzle1,
    puzzle2,
    puzzle3,
    puzzle4,
    puzzle5,
    puzzle6,
} from '~/puzzles';

async function start() {
    // await puzzle1.run();
    // await puzzle2.run();
    // await puzzle3.run();
    // await puzzle4.run();
    // await puzzle5.run();
    await puzzle6.run({
        example: true,
        mainProblem: true,
    });
}

start();
