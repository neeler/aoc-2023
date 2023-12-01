export class Timer {
    private startedAt: Date;

    constructor() {
        this.startedAt = new Date();
    }

    reset() {
        this.startedAt = new Date();
    }

    get time() {
        const msRun = new Date().valueOf() - this.startedAt.valueOf();
        const secRun = msRun / 1000;
        const minRun = secRun / 60;
        return `Ran for ${secRun.toFixed(2)} seconds (${minRun.toFixed(
            2
        )} minutes)`;
    }
}
