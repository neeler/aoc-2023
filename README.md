# AoC 2023

## Step 1
Generate new puzzle file.
```shell
npm run generate
```

## Step 2
Add puzzle data to new puzzle data files:
```
/data/puzzleX-example.ts
/data/puzzleX-input.ts
```

## Step 3
Write puzzle code in new puzzle file:
```
~/puzzles/puzzleX.ts
```

## Step 4
Run puzzle code as needed while solving.
Modify runner in `~/index.ts` to switch between example & main data sets for any puzzle. 
```shell
npm start
```
