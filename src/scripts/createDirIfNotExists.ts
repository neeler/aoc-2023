import { existsSync, mkdirSync } from 'fs';
import path from 'path';

export function createDirIfNotExists(relativePath: string): string {
    const fullPath = path.join(__dirname, relativePath);
    if (!existsSync(fullPath)) {
        mkdirSync(fullPath);
    }
    return fullPath;
}
