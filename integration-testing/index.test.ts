import * as fs from "fs";
import * as path from "path";
import { Grid } from "../src/Grid";

const TIMEOUT = 100 // ms

describe("Sudoku 50 easy grids (without expected solution)", () => {
    const inputs = fs.readFileSync(
        path.resolve(__dirname, "easy.txt"),
        { encoding: "ascii"}
    ).split("\n");

    test.concurrent.each(inputs)("%s", async (input) => {
        const grid = new Grid();
        await grid.parse(input);
        expect(await grid.solve()).toBe(true);
    }, TIMEOUT);
});

describe("Sudoku 95 hard grids", () => {
    const inputs = fs.readFileSync(
        path.resolve(__dirname, "hard.txt"),
        { encoding: "ascii"}
    ).split("\n");

    const solutions = fs.readFileSync(
        path.resolve(__dirname, "hard_solutions.txt"),
        { encoding: "ascii"}
    ).split("\n");

    test.concurrent.each(
        inputs.map((input, index) => [input, solutions[index]])
    )("%s", async (input, solution) => {
        const grid = new Grid();
        await grid.parse(input);
        expect(await grid.solve()).toBe(true);
        expect(grid.toString(".")).toBe(solution);
    }, TIMEOUT);
});
