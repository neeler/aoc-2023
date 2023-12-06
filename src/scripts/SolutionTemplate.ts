export function SolutionTemplate(day: number) {
    return `import { Puzzle } from './Puzzle';

export const puzzle${day} = new Puzzle({
    day: ${day},
    parseInput: (fileData) => {
        return fileData.split('\\n').filter((s) => s);
    },
    part1: (data) => {
        console.log(data);
    },
    part2: (data) => {
        //
    },
});
`;
}
