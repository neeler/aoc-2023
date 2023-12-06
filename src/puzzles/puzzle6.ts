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

        return {
            times,
            distances,
        };
    },
    part1: ({ times, distances }) => {
        const races = times.map((time, i) => ({
            time,
            record: distances[i]!,
        }));

        return product(races.map(nWaysToWin));
    },
    part2: ({ times, distances }) => {
        const time = parseInt(times.join(''), 10);
        const record = parseInt(distances.join(''), 10);

        return nWaysToWin({
            time,
            record,
        });
    },
});

function nWaysToWin(race: Race) {
    let wins = 0;
    for (let buttonTime = 1; buttonTime < race.time; buttonTime++) {
        const velocity = buttonTime;
        const timeRemaining = Math.max(0, race.time - buttonTime);
        const distanceTraveled = velocity * timeRemaining;
        if (distanceTraveled > race.record) {
            wins++;
        }
    }
    return wins;
}
