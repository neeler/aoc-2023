import { CustomSet } from '~/types/CustomSet';
import { Queue } from '~/types/Queue';
import { lcm } from '~/util/arithmetic';
import { Puzzle } from './Puzzle';

export const puzzle20 = new Puzzle({
    day: 20,
    parseInput: (fileData) => {
        const modules = new ModuleChain();
        fileData
            .split('\n')
            .filter((s) => s)
            .forEach((s) => {
                let [name = '', chainString = ''] = s.split(' -> ');
                const chain = chainString.split(', ');

                switch (name[0]) {
                    case '%':
                    case '&': {
                        modules.add({
                            name: name.slice(1),
                            inputs: [],
                            outputs: chain,
                            moduleType: name[0],
                        });
                        return;
                    }
                    default: {
                        if (name === 'broadcaster') {
                            modules.add({
                                name,
                                inputs: [],
                                outputs: chain,
                                moduleType: name,
                            });
                            return;
                        }
                        throw new Error(`Invalid module: ${name}`);
                    }
                }
            });
        return modules;
    },
    part1: (modules) => {
        for (let i = 0; i < 1000; i++) {
            modules.pushButton();
        }
        return modules.pulseScore;
    },
    part2: (modules) => {
        const targetModule = 'rx';

        const inputsOfTargetModule = modules.getInputOf(targetModule);
        const targetModuleInput = modules.modules.get(inputsOfTargetModule[0]!);
        if (
            inputsOfTargetModule.length !== 1 ||
            targetModuleInput?.moduleType !== '&'
        ) {
            return 'Skipping part 2 because the input is not valid';
        }

        const relevantInputs = targetModuleInput.inputs;

        while (
            relevantInputs.some(
                (name) => !modules.nPressesUntilLowSeen.has(name)
            )
        ) {
            modules.pushButton();
        }
        return relevantInputs
            .map((name) => modules.nPressesUntilLowSeen.get(name)!)
            .reduce(lcm, 1);
    },
});

type ModuleType = 'broadcaster' | '%' | '&';

const PulseTypes = {
    LOW: -1,
    HIGH: 1,
} as const;
type PulseType = (typeof PulseTypes)[keyof typeof PulseTypes];

interface Pulse {
    type: PulseType;
    source: string;
    destination: string;
}

interface Module {
    name: string;
    moduleType: ModuleType;
    inputs: string[];
    outputs: string[];
    isOn?: boolean;
    lastPulseReceivedFrom?: Record<string, PulseType>;
}

class ModuleChain {
    moduleNames: string[] = [];
    readonly modules = new CustomSet<Module>({
        getKey: (module) => module.name,
    });
    readonly pulses = new Queue<Pulse>();
    nLowPulses = 0;
    nHighPulses = 0;

    nButtonPresses = 0;
    nPressesUntilLowSeen = new Map<string, number>();
    nPressesUntilHighSeen = new Map<string, number>();

    add(module: Module) {
        this.modules.add(module);

        [module.name, ...module.inputs, ...module.outputs].forEach((names) => {
            if (!this.moduleNames.includes(names)) {
                this.moduleNames.push(names);
            }
        });

        this.modules.values().forEach((mod) => {
            mod.inputs = this.modules
                .values()
                .filter((m) => m.outputs.includes(mod.name))
                .map((m) => m.name);
        });
    }

    getInputOf(moduleName: string) {
        return this.modules
            .values()
            .filter((m) => m.outputs.includes(moduleName))
            .map((m) => m.name);
    }

    pushButton() {
        this.nButtonPresses++;
        this.pulses.add({
            type: PulseTypes.LOW,
            source: 'button',
            destination: 'broadcaster',
        });
        this.pulses.process((pulse) => {
            const destination = this.modules.get(pulse.destination);
            if (pulse.type === PulseTypes.LOW) {
                this.nLowPulses++;
            } else {
                this.nHighPulses++;
            }

            if (
                !this.nPressesUntilLowSeen.has(pulse.destination) &&
                pulse.type === PulseTypes.LOW
            ) {
                this.nPressesUntilLowSeen.set(
                    pulse.destination,
                    this.nButtonPresses
                );
            } else if (
                !this.nPressesUntilHighSeen.has(pulse.destination) &&
                pulse.type === PulseTypes.HIGH
            ) {
                this.nPressesUntilHighSeen.set(
                    pulse.destination,
                    this.nButtonPresses
                );
            }

            if (!destination) {
                return;
            }

            const outputPulse = (type: PulseType) => {
                destination.outputs.forEach((moduleName) => {
                    this.pulses.add({
                        type,
                        source: pulse.destination,
                        destination: moduleName,
                    });
                });
            };

            switch (destination.moduleType) {
                case 'broadcaster': {
                    outputPulse(pulse.type);
                    break;
                }
                case '%': {
                    if (pulse.type === PulseTypes.LOW) {
                        const wasOn = destination.isOn ?? false;
                        destination.isOn = !wasOn;
                        outputPulse(wasOn ? PulseTypes.LOW : PulseTypes.HIGH);
                    }
                    break;
                }
                case '&': {
                    const lastPulseReceivedFrom =
                        destination.lastPulseReceivedFrom ?? {};
                    destination.lastPulseReceivedFrom = lastPulseReceivedFrom;
                    lastPulseReceivedFrom[pulse.source] = pulse.type;

                    const remembersHighPulsesForAllSources =
                        destination.inputs.every((moduleName) => {
                            const pulse =
                                lastPulseReceivedFrom[moduleName] ??
                                PulseTypes.LOW;
                            return pulse === PulseTypes.HIGH;
                        });
                    outputPulse(
                        remembersHighPulsesForAllSources
                            ? PulseTypes.LOW
                            : PulseTypes.HIGH
                    );
                    break;
                }
            }
        });
    }

    get key() {
        return parseInt(
            this.modules
                .values()
                .map((m) => (m.isOn ? 1 : 0))
                .join(''),
            2
        );
    }

    get pulseScore() {
        return this.nLowPulses * this.nHighPulses;
    }
}
