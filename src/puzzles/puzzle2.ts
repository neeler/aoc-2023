import { Puzzle } from './Puzzle';

type Color = 'red' | 'green' | 'blue';
const colors: Color[] = ['red', 'green', 'blue'];
type ColorCount = Record<Color, number>;

export const puzzle2 = new Puzzle({
    day: 2,
    processFile: (fileData) => {
        const lines = fileData.trim().split('\n');
        return lines.map((line) => {
            const gameId = parseInt(line.match(/Game ([^:]*):/)?.[1] ?? '', 10);
            if (Number.isNaN(gameId)) {
                throw new Error('Non-numerical game ID');
            }
            const [, roundContent] = line.split(': ');
            const rounds = roundContent.split('; ').map((round) =>
                round
                    .split(', ')
                    .map((group) => {
                        const [count, color] = group.split(' ');
                        if (!isColor(color)) {
                            throw new Error(`Invalid color: ${color}`);
                        }
                        return {
                            color,
                            count: parseInt(count, 10),
                        };
                    })
                    .reduce<ColorCount>(
                        (counts, { color, count }) => {
                            counts[color] = count;
                            return counts;
                        },
                        {
                            red: 0,
                            green: 0,
                            blue: 0,
                        }
                    )
            );
            return {
                id: gameId,
                rounds,
            };
        });
    },
    part1: (games) => {
        const bagContents: ColorCount = {
            red: 12,
            green: 13,
            blue: 14,
        };
        const possibleGames = games.filter((game) =>
            colors.every((color) =>
                game.rounds.every((round) => round[color] <= bagContents[color])
            )
        );
        return possibleGames.reduce((sum, g) => sum + g.id, 0);
    },
    part2: (games) => {
        const minimums = games.map((game) =>
            Object.fromEntries(
                colors.map((color) => {
                    const maxSeen = Math.max(
                        ...game.rounds.map((round) => round[color] ?? 0)
                    );
                    return [color, maxSeen];
                })
            )
        );
        return minimums
            .map((counts) =>
                Object.values(counts).reduce((mul, c) => mul * c, 1)
            )
            .reduce((sum, v) => sum + v, 0);
    },
});

function isColor(s: string): s is Color {
    return (colors as string[]).includes(s);
}
