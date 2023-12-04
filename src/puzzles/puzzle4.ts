import { Puzzle } from './Puzzle';

interface Card {
    id: number;
    nWinners: number;
}

export const puzzle4 = new Puzzle<Card[]>({
    day: 4,
    parseInput: (fileData) => {
        const cardLines = fileData.split('\n').filter((s) => s);
        return cardLines.map((cardData) => {
            const [, cardId = '', winnersString = '', cardNumbersString = ''] =
                cardData.match(/Card\s*(\d*):\s*([\d ]*)\s*\|\s*([\d ]*)/) ??
                [];

            const cardNumbers = [...cardNumbersString.matchAll(/\d*/g)].reduce<
                number[]
            >((acc, [match]) => {
                if (match) {
                    acc.push(parseInt(match, 10));
                }
                return acc;
            }, []);

            const winnerMap: Record<string, boolean> = {};
            [...winnersString.matchAll(/\d*/g)].forEach(([match]) => {
                if (match) {
                    winnerMap[match] = true;
                }
            }, []);

            const winnersOnCard = cardNumbers.filter((n) => winnerMap[n]);

            return {
                id: parseInt(cardId, 10),
                nWinners: winnersOnCard.length,
            };
        });
    },
    part1: (cards) => {
        return cards.reduce((sum, card) => {
            return sum + (card.nWinners ? 2 ** (card.nWinners - 1) : 0);
        }, 0);
    },
    part2: (cards) => {
        const scoreById: Record<string, number> = {};
        function getScore({ id, nWinners }: Card) {
            const cachedScore = scoreById[id];
            if (cachedScore !== undefined) {
                return cachedScore;
            }

            let score = 1;

            for (let i = 0; i < nWinners; i++) {
                const card = cards[id + i];
                if (card) {
                    score += getScore(card);
                }
            }
            scoreById[id] = score;

            return score;
        }

        return cards.reduce((sum, card) => {
            const cardScore = getScore(card);
            return sum + cardScore;
        }, 0);
    },
});
