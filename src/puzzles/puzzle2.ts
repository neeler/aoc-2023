import { Puzzle } from './Puzzle';

type Color = 'red' | 'green' | 'blue';
const colors = ['red', 'green', 'blue'] satisfies Color[];
type ColorCount = Record<Color, number>;

function isColor(s: string): s is Color {
    return (colors as string[]).includes(s);
}

function newColorCount(counts: Partial<ColorCount> = {}): ColorCount {
    return {
        red: 0,
        green: 0,
        blue: 0,
        ...counts,
    };
}

export const puzzle2 = new Puzzle<{
    id: number;
    rounds: ColorCount[];
}>({
    day: 2,
    parseLineByLine: true,
    parseInput: (line) => {
        const [, gameId, roundContents = ''] =
            line.match(/Game (\d*): (.*)/) ?? [];

        const rounds = roundContents.split('; ').map((round) =>
            newColorCount(
                Object.fromEntries(
                    round.split(', ').map((group) => {
                        const [count, color] = group.split(' ');
                        if (!isColor(color ?? '')) {
                            throw new Error(`Invalid color: ${color}`);
                        }
                        return [color, parseInt(count ?? '', 10)];
                    })
                )
            )
        );

        return {
            id: parseInt(gameId ?? '', 10),
            rounds,
        };
    },
    part1: (games) => {
        const bagContents = newColorCount({
            red: 12,
            green: 13,
            blue: 14,
        });
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
                        ...game.rounds.map((round) => round[color])
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
