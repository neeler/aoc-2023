import {
    puzzle1,
    puzzle2,
    puzzle3,
    puzzle4,
    puzzle5,
    puzzle6,
    puzzle7,
    puzzle8,
    puzzle9,
    puzzle10,
} from '~/puzzles';

async function start() {
    // await puzzle1.run();
    // await puzzle2.run();
    // await puzzle3.run();
    // await puzzle4.run();
    // await puzzle5.run();
    // await puzzle6.run();
    // await puzzle7.run();
    // await puzzle8.run();
    // await puzzle9.run();
    await puzzle10.run({
        example: true,
        mainProblem: true,
    });
}

start();
