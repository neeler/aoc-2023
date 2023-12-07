import { sum } from '~/util/arithmetic';
import { Puzzle } from './Puzzle';

interface Round {
    hand: string[];
    handString: string;
    bid: number;
}

export const puzzle7 = new Puzzle<Round[]>({
    day: 7,
    parseInput: (fileData) => {
        const lines = fileData.split('\n').filter((s) => s);
        return lines.map((line) => {
            const [handString = '', bidString = ''] = line.split(/\s+/);
            const hand = handString.split('');
            const bid = parseInt(bidString, 10);
            return {
                hand,
                handString,
                bid,
            };
        });
    },
    part1: (rounds) => {
        return calculateTotalWinnings(rounds);
    },
    part2: (rounds) => {
        return calculateTotalWinnings(rounds, {
            withJoker: true,
        });
    },
});

/**
 * Calculate the total winnings for a set of rounds
 * @param rounds The rounds to calculate winnings for
 * @param withJoker Whether to allow jokers to be used
 */
function calculateTotalWinnings(
    rounds: Round[],
    {
        withJoker = false,
    }: {
        withJoker?: boolean;
    } = {}
) {
    const cardLabels = withJoker
        ? ['A', 'K', 'Q', 'T', '9', '8', '7', '6', '5', '4', '3', '2', 'J']
        : ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    const cardStrength = Object.fromEntries(
        cardLabels.toReversed().map((card, index) => [card, index + 1])
    );

    /**
     * Ordered list of hands from strongest to weakest
     * Each hand has a name and a function that checks if a hand matches that type
     */
    const orderedHands: {
        name: string;
        matchesHand: (hand: string[]) => boolean;
    }[] = [
        {
            name: 'Five of a kind',
            matchesHand: (hand) => isNOfKind(hand, 5),
        },
        {
            name: 'Four of a kind',
            matchesHand: (hand) => isNOfKind(hand, 4),
        },
        {
            name: 'Full house',
            matchesHand: (hand) => {
                const count = countCards(hand);
                const pairsOrTriples = Object.entries(count).filter(
                    ([, c]) => c >= 2
                );
                return (
                    pairsOrTriples.length === 2 &&
                    pairsOrTriples.some(([, c]) => c === 3)
                );
            },
        },
        {
            name: 'Three of a kind',
            matchesHand: (hand) => isNOfKind(hand, 3),
        },
        {
            name: 'Two pair',
            matchesHand: (hand) => {
                const count = countCards(hand);
                const pairsOrTriples = Object.entries(count).filter(
                    ([, c]) => c === 2
                );
                return pairsOrTriples.length === 2;
            },
        },
        {
            name: 'One pair',
            matchesHand: (hand) => isNOfKind(hand, 2),
        },
        {
            name: 'High card',
            matchesHand: () => true,
        },
    ];

    /**
     * Score all rounds
     */
    const scoredRounds = rounds.map(({ hand, handString, bid }) => {
        const { score, handName } = calculateHandScore(hand);
        return {
            handString,
            bid,
            score,
            handName,
        };
    });

    /**
     * Sort all rounds by score
     */
    const sortedRounds = scoredRounds.toSorted((a, b) => a.score - b.score);

    /**
     * Calculate winnings using rank (index + 1)
     */
    return sum(sortedRounds.map((round, index) => round.bid * (index + 1)));

    /**
     * Internal function definitions
     */

    /**
     * Count the number of each card in a hand
     */
    function countCards(hand: string[]) {
        return hand.reduce<Record<string, number>>((acc, card) => {
            if (!acc[card]) {
                acc[card] = 0;
            }
            acc[card]++;
            return acc;
        }, {});
    }

    /**
     * Score a card based on its strength
     */
    function scoreCard(card: string) {
        return cardStrength[card] ?? 0;
    }

    /**
     * Check if a hand has N of a kind
     */
    function isNOfKind(hand: string[], n: number) {
        const count = countCards(hand);
        return Boolean(Object.entries(count).find(([, c]) => c === n));
    }

    /**
     * Calculate the score for a hand
     */
    function calculateHandScore(hand: string[]) {
        for (const [index, { name, matchesHand }] of orderedHands.entries()) {
            /**
             * Check if the hand matches the current hand type
             *
             * Either the hand matches exactly or the hand matches with a joker
             */
            const isMatch =
                (!withJoker && matchesHand(hand)) ||
                (withJoker &&
                    cardLabels.some(
                        (c) =>
                            c !== 'J' &&
                            matchesHand(
                                hand.map((card) => (card === 'J' ? c : card))
                            )
                    ));
            if (isMatch) {
                /**
                 * Build a hex score that can be used to compare hands with a simple number comparison.
                 * Using hex since it's easily readable and large enough to cover all card types.
                 *
                 * First digit for the hand type (use the index in the orderedHands array)
                 * Subsequent digit for each card in the hand (use the scoreCard function)
                 */
                const typeDigit = (orderedHands.length - index).toString();
                const cardDigits = hand.map((card) =>
                    scoreCard(card).toString(16)
                );
                const hexScore = `${typeDigit}${cardDigits.join('')}`;
                return {
                    handName: name,
                    hexScore,
                    score: parseInt(hexScore, 16),
                };
            }
        }
        throw new Error(`Could not score hand ${hand}`);
    }
}
