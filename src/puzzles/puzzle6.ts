import { product } from '~/util/arithmetic';
import { Puzzle } from './Puzzle';

interface Race {
    time: number;
    record: number;
}

export const puzzle6 = new Puzzle({
    day: 6,
    parseInput: (fileData) => {
        const [timeLine = '', distanceLine = ''] = fileData.split('\n');

        const times = timeLine
            .split(/\s+/)
            .slice(1)
            .map((s) => parseInt(s, 10));
        const distances = distanceLine
            .split(/\s+/)
            .slice(1)
            .map((s) => parseInt(s, 10));

        return fileData;
    },
    part1: (fileData) => {
        const races = getRaces(fileData.split('\n'));

        return product(races.map(nWaysToWin));
    },
    part2: (fileData) => {
        const races = getRaces(
            fileData.split('\n').map((s) => s.replace(/\s/g, ''))
        );

        return product(races.map(nWaysToWin));
    },
});

function getRaces(lines: string[]) {
    const [timeLine = '', distanceLine = ''] = lines;

    const times = [...timeLine.matchAll(/(\d+)/g)].map(([s]) =>
        parseInt(s, 10)
    );
    const distances = [...distanceLine.matchAll(/(\d+)/g)].map(([s]) =>
        parseInt(s, 10)
    );

    return times.map((time, iGame): Race => {
        const record = distances[iGame];
        if (!record) {
            throw new Error(`No record for game ${iGame}`);
        }
        return {
            time,
            record,
        };
    });
}

function nWaysToWin(race: Race) {
    let wins = 0;
    for (let buttonTime = 1; buttonTime < race.time; buttonTime++) {
        const velocity = buttonTime;
        const timeRemaining = race.time - buttonTime;
        const distanceTraveled = velocity * timeRemaining;
        if (distanceTraveled > race.record) {
            wins++;
        }
    }
    return wins;
}
