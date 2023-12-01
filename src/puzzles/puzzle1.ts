import { Puzzle } from './Puzzle';

export const puzzle1 = new Puzzle({
    day: 1,
    processFile: (fileData) => {
        const lines = fileData.trim().split('\n');
        return lines;
    },
    part1: (data) => {
        console.log(data);
    },
    part2: (data) => {
        //
    },
});
