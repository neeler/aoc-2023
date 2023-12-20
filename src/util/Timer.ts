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

        const times: string[] = [];
        if (secRun < 1) {
            times.push(`${msRun} ms`);
        } else if (minRun < 1) {
            times.push(`${secRun.toFixed(3)} seconds`);
        } else {
            times.push(`${minRun.toFixed(2)} minutes`);
        }

        return `${times.join(' / ')}`;
    }
}
