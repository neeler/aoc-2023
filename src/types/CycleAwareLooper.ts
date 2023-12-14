import kleur from 'kleur';

/**
 * A looper that is aware of cycles in the output of the configured action function.
 *
 * If the action function returns a string that has been returned before,
 * we can skip ahead to the end of the cycle.
 */
export class CycleAwareLooper {
    readonly previousStates = new Map<string, number>();
    cycleStart: number | undefined;
    cycleLength: number | undefined;

    constructor(
        readonly config: {
            /**
             * Number of iterations to run.
             */
            nIterations: number;
            /**
             * Action function to run each cycle.
             * Should return a string that represents the state of the system.
             */
            action: () => string;
            /**
             * Whether to log debug information.
             */
            debug?: boolean;
        }
    ) {}

    /**
     * Run the configured action function for the configured number of iterations.
     *
     * If the action function returns a string that has been returned before,
     * we can skip ahead to the end of the cycle.
     */
    run() {
        for (let iCycle = 0; iCycle < this.config.nIterations; iCycle++) {
            const iterationKey = this.config.action();

            if (this.previousStates.has(iterationKey)) {
                if (this.cycleStart === undefined) {
                    this.cycleStart = this.previousStates.get(iterationKey)!;
                    this.cycleLength = iCycle - this.cycleStart;
                    if (this.config.debug) {
                        console.log(
                            kleur.yellow(`Cycle detected at:\t${iCycle}
Cycle length:\t\t${this.cycleLength}
`)
                        );
                    }

                    const nRemainingCycles = this.config.nIterations - iCycle;
                    iCycle +=
                        Math.floor(nRemainingCycles / this.cycleLength) *
                        this.cycleLength;
                }
            }

            this.previousStates.set(iterationKey, iCycle);
        }
    }

    /**
     * Reset the looper to its initial state.
     */
    reset() {
        this.previousStates.clear();
        this.cycleStart = undefined;
        this.cycleLength = undefined;
    }
}
