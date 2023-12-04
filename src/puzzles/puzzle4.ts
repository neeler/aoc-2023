import { CachedFunction } from '~/util/CachedFunction';
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
                cardData.match(/Card\s+(\d*):\s+([\d ]*)\s+\|\s+([\d ]*)/) ??
                [];

            const isWinner: Record<string, boolean> = {};
            winnersString.split(/\s+/g).forEach((n) => {
                isWinner[n] = true;
            });

            let nWinners = 0;

            cardNumbersString.split(/\s+/g).forEach((n) => {
                if (isWinner[n]) {
                    nWinners++;
                }
            });

            return {
                id: parseInt(cardId, 10),
                nWinners,
            };
        });
    },
    part1: (cards) => {
        return cards.reduce((sum, card) => {
            return sum + (card.nWinners ? 2 ** (card.nWinners - 1) : 0);
        }, 0);
    },
    part2: (cards) => {
        const scoreCalculator = new CachedFunction({
            func: ({ id, nWinners }: Card) => {
                let score = 1;

                for (let i = 0; i < nWinners; i++) {
                    const card = cards[id + i];
                    if (card) {
                        score += scoreCalculator.run(card);
                    }
                }

                return score;
            },
            getKey: (card) => card.id,
        });

        return cards.reduce((sum, card) => {
            const cardScore = scoreCalculator.run(card);
            return sum + cardScore;
        }, 0);
    },
});
