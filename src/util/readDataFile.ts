import { readFileSync } from 'fs';
import path from 'path';

export function readDataFile(fileName: string) {
    try {
        return readFileSync(path.join(__dirname, '../../data', fileName), {
            encoding: 'utf-8',
        }).trim();
    } catch {
        throw new Error(`File ${fileName} not defined yet.`);
    }
}
