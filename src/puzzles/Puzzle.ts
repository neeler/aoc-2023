import kleur from 'kleur';
import { year } from '~/constants';
import { Timer } from '~/util/Timer';
import { readDataFile } from '~/util/readDataFile';

interface FileProcessorOptions {
    example?: boolean;
    puzzle?: boolean;
}

type FileProcessor<TData> = (
    fileData: string,
    options: FileProcessorOptions
) => TData;

interface PuzzleConfig<TData> {
    day: number;
    parseInput: FileProcessor<TData>;
    example1?: (data: TData) => any;
    part1: (data: TData) => any;
    example2?: (data: TData) => any;
    part2: (data: TData) => any;
    skipExample?: boolean;
    skipPart1?: boolean;
    skipPart2?: boolean;
}

export class Puzzle<TData = string> {
    constructor(private readonly config: PuzzleConfig<TData>) {}

    private processFile(fileData: string, options: FileProcessorOptions) {
        return this.config.parseInput(fileData.trim(), options);
    }

    async run({
        example = false,
        mainProblem = true,
    }: { example?: boolean; mainProblem?: boolean } = {}) {
        let exampleData: TData | undefined;
        if (example) {
            const data = readDataFile(`puzzle${this.config.day}-example.txt`);
            if (data) {
                exampleData = this.processFile(data, { example: true });
            }
        }

        let puzzleData: TData | undefined;
        if (mainProblem) {
            const data = readDataFile(`puzzle${this.config.day}-input.txt`);
            if (data) {
                puzzleData = this.processFile(data, { puzzle: true });
            }
        }

        if (!(exampleData || puzzleData)) {
            return;
        }

        const timer = new Timer();
        console.log(
            kleur.magenta(`
AoC ${year} Day ${this.config.day}
`)
        );

        if (!this.config.skipPart1) {
            if (exampleData) {
                const result = await (
                    this.config.example1 ?? this.config.part1
                )(exampleData);

                printResult({
                    part: 1,
                    label: 'Example',
                    result,
                    timer,
                });
            }

            if (puzzleData) {
                timer.reset();

                const result = await this.config.part1(puzzleData);

                printResult({
                    part: 1,
                    label: 'Input',
                    result,
                    timer,
                });
            }
        }

        if (!this.config.skipPart2) {
            if (exampleData) {
                const result = await (
                    this.config.example2 ?? this.config.part2
                )(exampleData);

                printResult({
                    part: 2,
                    label: 'Example',
                    result,
                    timer,
                });
            }

            if (puzzleData) {
                timer.reset();

                const result = await this.config.part2(puzzleData);

                printResult({
                    part: 2,
                    label: 'Input',
                    result,
                    timer,
                });
            }
        }
    }
}

function printResult({
    part,
    label,
    result,
    timer,
    indent = '  ',
}: {
    part: number;
    label: 'Example' | 'Input';
    result: number;
    timer: Timer;
    indent?: string;
}) {
    console.log(
        kleur.bold().magenta(`${indent}Part ${part} `) + kleur.blue(label)
    );

    if (result === undefined) {
        console.log(kleur.yellow(`${indent}Not solved yet.`));
    } else {
        console.log(
            kleur.white(`${indent}Result `) + kleur.bold().green(result)
        );
        console.log(kleur.white(`${indent}${timer.time}`));
    }

    console.log('');
}
