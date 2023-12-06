# AoC 2023

## Initial Setup

Just cloned the repo? Follow these instructions to get set up.

### Step 1 - Install dependencies.

```shell
npm install
```

### Step 2 - Add puzzle inputs.

Notice the new `data` directory, created by the `postinstall` (AKA `setup`) script.
It should have prepopulated the folder with two blank files for each puzzle X:

- `puzzleX-example.txt`
- `puzzleX-input.txt`

This is where you'll add your puzzle inputs; just paste the respective contents into each file.

> [!TIP]
>
> You can automate the data entry process by adding your session token to the `.env` file.
> You can find your session key in the 'session' cookie at: https://adventofcode.com.
> Then run the `npm run setup` command to fetch the inputs for all puzzles.

### Step 3 - Run puzzle solution(s).

The `src/index.ts` file contains a runner that will run the puzzle solutions.

You can choose to run any subset of the existing puzzle solutions.
You can also choose to run either the example or main data set, or both, for any puzzle.

```typescript
    // await puzzle1.run();
    // await puzzle2.run();
    // await puzzle3.run();
    // await puzzle4.run();
    await puzzle5.run({
        example: true,
        mainProblem: false,
    });
```
The above example will just run the example data set for puzzle 5.

## New Puzzle Setup

Ready to start a new puzzle? Follow these instructions to generate the necessary files.

### Step 1 - Generate new puzzle files.

The script will automatically detect which puzzle you're on (based on existence of files in `puzzles` folder), and generate the necessary files.

```shell
npm run generate
```

### Step 2 - Add puzzle data.

Two new (blank) puzzle data files should now exist in the `data` folder:
```
data/puzzleX-example.ts
data/puzzleX-input.ts
```

### Step 3 - Get cracking!

Write puzzle code in new puzzle file:
```
src/puzzles/puzzleX.ts
```

Run puzzle code as needed while solving.

For a single run:
```shell
npm start
```

For a `nodemon` file-watched run:
```shell
npm run dev
```


Modify runner in `src/index.ts` to switch between example & main data sets for any puzzle. 
