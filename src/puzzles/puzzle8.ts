import { CustomSet } from '~/types/CustomSet';
import { lcm } from '~/util/arithmetic';
import { Puzzle } from './Puzzle';

export class Graph extends CustomSet<Node, string> {
    constructor() {
        super({
            getKey: (node) => node.id,
        });
    }
}

class Node {
    id: string;
    graph: Graph;
    isStart: boolean;
    isEnd: boolean;
    leftNodeId: string;
    rightNodeId: string;

    constructor({
        id,
        left,
        right,
        graph,
    }: {
        id: string;
        left: string;
        right: string;
        graph: Graph;
    }) {
        this.id = id;
        this.graph = graph;
        this.isStart = this.id.endsWith('A');
        this.isEnd = this.id.endsWith('Z');
        this.leftNodeId = left;
        this.rightNodeId = right;
    }

    go(direction?: string): Node {
        switch (direction) {
            case 'L':
                return this.graph.get(this.leftNodeId) ?? this;
            case 'R':
                return this.graph.get(this.rightNodeId) ?? this;
            default:
                return this;
        }
    }
}

export const puzzle8 = new Puzzle({
    day: 8,
    parseInput: (fileData) => {
        const [instructions = '', ...lines] = fileData
            .split('\n')
            .filter((s) => s);
        const graph = new Graph();
        lines.forEach((line) => {
            const [[id = ''] = [], [left = ''] = [], [right = ''] = []] = [
                ...line.matchAll(/\w+/g),
            ];
            graph.add(new Node({ id, left, right, graph }));
        });
        return {
            instructions: instructions.split(''),
            graph,
        };
    },
    part1: ({ instructions, graph }) => {
        let nSteps = 0;
        let currentNode = graph.get('AAA');
        let endNode = graph.get('ZZZ');
        let iInstruction = 0;
        while (currentNode && endNode && currentNode !== endNode) {
            const direction = instructions[iInstruction];
            currentNode = currentNode.go(direction);
            nSteps++;
            iInstruction = (iInstruction + 1) % instructions.length;
        }
        return nSteps;
    },
    part2: ({ instructions, graph }) => {
        let nSteps = 0;
        let currentNodes = graph.values().filter((node) => node.isStart);
        let iInstruction = 0;
        const stepsToStateForNodes: Record<string, number>[] = currentNodes.map(
            (node) => {
                const key = getStateKey({ iInstruction, node });
                return { [key]: nSteps };
            }
        );
        const cycleDetectedForNodes: (CycleDefinition | null)[] =
            currentNodes.map(() => null);

        while (
            cycleDetectedForNodes.some(
                (cycle) => cycle?.endOffset === undefined
            )
        ) {
            const direction = instructions[iInstruction];
            currentNodes = currentNodes.map((node, iNode) => {
                const stepsToState = stepsToStateForNodes[iNode]!;
                const nextNode = node.go(direction);
                const nextStateKey = getStateKey({
                    iInstruction,
                    node: nextNode,
                });
                const existingStepsToState = stepsToState[nextStateKey];
                if (existingStepsToState !== undefined) {
                    const existingCycleDef = cycleDetectedForNodes[iNode];
                    if (existingCycleDef) {
                        if (node.isEnd) {
                            existingCycleDef.endOffset =
                                (nSteps -
                                    existingCycleDef.cycleStart -
                                    existingCycleDef.cycleLength) %
                                existingCycleDef.cycleLength;
                        }
                    } else {
                        const cycleLength = nSteps + 1 - existingStepsToState;
                        const cycleDef: CycleDefinition = {
                            cycleStart: nSteps - cycleLength,
                            cycleLength: cycleLength,
                        };
                        cycleDetectedForNodes[iNode] = cycleDef;

                        if (node.isEnd) {
                            cycleDef.endOffset =
                                nSteps - cycleDef.cycleStart - cycleLength;
                        }
                    }
                }
                stepsToState[nextStateKey] = nSteps + 1;
                return nextNode;
            });
            nSteps++;
            iInstruction = (iInstruction + 1) % instructions.length;
        }

        const cycles = validateCycleAssumptions(cycleDetectedForNodes);

        return cycles.map((cycle) => cycle.cycleLength).reduce(lcm);
    },
});

interface TravelState {
    iInstruction: number;
    node: Node;
}

function getStateKey(state: TravelState) {
    return `${state.iInstruction}:${state.node.id}`;
}

interface CycleDefinition {
    cycleStart: number;
    cycleLength: number;
    endOffset?: number;
}

/**
 * I observed that the (cycleStart + endOffset) % cycleLength = 0 for all cycles.
 * This greatly simplifies the problem, but it's not technically general.
 * Let's just throw an error if this assumption doesn't hold.
 */
function validateCycleAssumptions(
    cycles: (CycleDefinition | null)[]
): CycleDefinition[] {
    const validCycles: CycleDefinition[] = [];
    for (const cycle of cycles) {
        if (!cycle) {
            throw new Error('Expected cycle to be defined');
        }
        if (cycle.endOffset === undefined) {
            throw new Error('Expected cycle to be complete');
        }
        const { cycleStart, cycleLength, endOffset } = cycle;
        if ((cycleStart + endOffset) % cycleLength !== 0) {
            throw new Error('Cycle assumptions invalid');
        }
        validCycles.push(cycle);
    }
    return validCycles;
}
