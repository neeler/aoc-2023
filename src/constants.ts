import dotenv from 'dotenv';

dotenv.config();

export const year = process.env.AOC_YEAR || new Date().getFullYear().toString();

export const sessionKey = process.env.AOC_SESSION_KEY;
