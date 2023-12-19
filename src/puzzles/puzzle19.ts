import { Stack } from '~/types/Stack';
import { sum } from '~/util/arithmetic';
import { Puzzle } from './Puzzle';

export const puzzle19 = new Puzzle({
    day: 19,
    parseInput: (fileData) => {
        const [workflowStrings = [], ratingStrings = []] = fileData
            .split('\n\n')
            .map((data) => data.split('\n'));

        const workflows = workflowStrings.map((s): Workflow => {
            const [, workflowName = '', rulesString = ''] =
                s.match(/(\w+)\{(.+)}/) ?? [];
            const ruleLines = rulesString.split(',');
            const catchAll = ruleLines.pop()!;

            return {
                name: workflowName,
                rules: ruleLines.map((rule): WorkflowRule => {
                    const [
                        ,
                        property = '',
                        operator = '',
                        targetValue = '',
                        destination = '',
                    ] = rule.match(/(\w+)([><])(\d+):(\w+)/) ?? [];
                    const isTrue: RuleChecker = (() => {
                        switch (operator) {
                            case '>': {
                                return (part: any) => {
                                    return part?.[property] > targetValue;
                                };
                            }
                            case '<': {
                                return (part: any) => {
                                    return part?.[property] < targetValue;
                                };
                            }
                            default: {
                                throw new Error(
                                    `Unknown operator: ${operator}`
                                );
                            }
                        }
                    })();

                    return {
                        property: property as PartProperty,
                        operator,
                        targetValue: parseInt(targetValue, 10),
                        destination,
                        isTrue,
                    };
                }),
                catchAll,
            };
        });
        const workflowDictionary = Object.fromEntries(
            workflows.map((w) => [w.name, w])
        );

        const parts: Part[] = ratingStrings.map((s, iPart) => {
            const properties = s.match(/(\w+=\d+)/g) ?? [];
            return Object.fromEntries(
                properties.map((str): [PartProperty, number] => {
                    const [name = '', value = ''] = str.split('=');
                    if (!isPartProperty(name)) {
                        throw new Error(`Unknown property: ${name}`);
                    }
                    return [name, parseInt(value, 10)];
                })
            ) as unknown as Part;
        });

        const initialWorkflow = workflowDictionary['in'];

        if (!initialWorkflow) {
            throw new Error('No initial workflow found');
        }

        return {
            workflows,
            workflowDictionary,
            initialWorkflow,
            parts,
        };
    },
    part1: ({ initialWorkflow, workflowDictionary, parts }) => {
        return sum(
            parts
                .filter((part) => {
                    let workflow: Workflow | undefined = initialWorkflow;
                    while (workflow) {
                        const matchingRule: WorkflowRule | undefined =
                            workflow.rules.find((rule) => rule.isTrue(part));
                        const destination: string | undefined =
                            matchingRule?.destination ?? workflow.catchAll;
                        switch (destination) {
                            case 'A': {
                                return true;
                            }
                            case 'R': {
                                return false;
                            }
                            default: {
                                workflow = workflowDictionary[destination];
                                break;
                            }
                        }
                    }
                    return false;
                })
                .map((part) => sum(Object.values(part)))
        );
    },
    part2: ({ initialWorkflow, workflowDictionary }) => {
        const min = 1;
        const max = 4000;

        const validPartRanges: Record<PartProperty, Range>[] = [];

        const stack = new Stack<{
            partRanges: Record<PartProperty, Range>;
            workflow: Workflow;
            ruleIndex: number;
        }>();

        stack.add({
            partRanges: {
                x: [min, max],
                m: [min, max],
                a: [min, max],
                s: [min, max],
            },
            workflow: initialWorkflow,
            ruleIndex: 0,
        });

        stack.process(({ partRanges, workflow, ruleIndex }) => {
            const rule = workflow.rules[ruleIndex];

            if (!rule) {
                switch (workflow.catchAll) {
                    case 'A': {
                        validPartRanges.push(partRanges);
                        return;
                    }
                    case 'R': {
                        return;
                    }
                    default: {
                        const destinationWorkflow =
                            workflowDictionary[workflow.catchAll];
                        if (destinationWorkflow) {
                            stack.add({
                                partRanges,
                                workflow: destinationWorkflow,
                                ruleIndex: 0,
                            });
                        }
                        return;
                    }
                }
            }

            const { property, operator, destination, targetValue } = rule;

            const range = partRanges[property];
            let trueRange: Range | undefined;
            let falseRange: Range | undefined;

            const isValidRange = (range: Range) => {
                return (
                    range[0] >= min && range[1] <= max && range[0] <= range[1]
                );
            };

            // if range overlaps targetValue, split into two ranges
            if (range[0] <= targetValue && range[1] >= targetValue) {
                if (operator === '>') {
                    trueRange = [targetValue + 1, range[1]];
                    falseRange = [range[0], targetValue];
                } else {
                    trueRange = [range[0], targetValue - 1];
                    falseRange = [targetValue, range[1]];
                }
            }
            // if range is less than targetValue
            else if (range[1] < targetValue) {
                if (operator === '>') {
                    falseRange = range;
                } else {
                    trueRange = range;
                }
            }
            // if range is greater than targetValue
            else if (range[0] > targetValue) {
                if (operator === '>') {
                    trueRange = range;
                } else {
                    falseRange = range;
                }
            }

            if (trueRange && isValidRange(trueRange)) {
                const newRanges = {
                    ...partRanges,
                    [property]: trueRange,
                };
                switch (destination) {
                    case 'A': {
                        validPartRanges.push(newRanges);
                        break;
                    }
                    case 'R': {
                        break;
                    }
                    default: {
                        const destinationWorkflow =
                            workflowDictionary[destination];
                        if (destinationWorkflow) {
                            stack.add({
                                partRanges: newRanges,
                                workflow: destinationWorkflow,
                                ruleIndex: 0,
                            });
                        }
                        break;
                    }
                }
            }
            if (falseRange && isValidRange(falseRange)) {
                stack.add({
                    partRanges: {
                        ...partRanges,
                        [property]: falseRange,
                    },
                    workflow,
                    ruleIndex: ruleIndex + 1,
                });
            }
        });

        // calculate total valid combinations of values
        // based on the valid ranges for each property
        return validPartRanges.reduce((total, partRanges) => {
            const validCombinations = Object.values(partRanges).reduce(
                (total, range) => {
                    const [min, max] = range;
                    return total * (max - min + 1);
                },
                1
            );
            return total + validCombinations;
        }, 0);
    },
});

type Range = [number, number];

interface Workflow {
    name: string;
    rules: WorkflowRule[];
    catchAll: string;
}

interface WorkflowRule {
    property: PartProperty;
    operator: string;
    targetValue: number;
    destination: string;
    isTrue: RuleChecker;
}

type RuleChecker = (part: Partial<Part>) => boolean;

type PartProperty = keyof Part;
function isPartProperty(property: string): property is PartProperty {
    return ['x', 'm', 'a', 's'].includes(property);
}

interface Part {
    x: number;
    m: number;
    a: number;
    s: number;
}
