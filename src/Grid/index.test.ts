import { GRID_SIZE, DIGITS, SQUARES, UNITS, SQUARE_PEERS, toSquare } from "../GridDefinition";
import type { Square, Digit, Unit, Peers } from "../GridDefinition";
import { Grid, initSquares, assign, eliminate, resolveDigits } from "./index";
import type { ValuesMap } from "./index";

describe("Sudoku grid class", () => {
    test("parse initialize possible values", () => {
        const grid = new Grid();
        expect(grid.values.size).toBe(0);
        expect(() => grid.parse(".".repeat(GRID_SIZE))).not.toThrow();
        SQUARES.forEach((square: Square) => {
            expect(grid.values.get(square)).toEqual(DIGITS);
        });
    });

    test("parse should throw on invalid data length", () => {
        const grid = new Grid();
        expect(() => grid.parse("")).toThrow(`"data": length is 0, expected ${GRID_SIZE}`);
    });

    test("parse should throw on invalid character", () => {
        const grid = new Grid();
        expect(() => grid.parse("A".repeat(GRID_SIZE))).toThrow(
            `"data": invalid character A, expected one of ${["0", ".", ...DIGITS].join(",")}`
        );
    });
});

const square = toSquare("A", 1);
const digit = 3;
const values: ValuesMap = new Map();

describe("Sudoku grid functions", () => {
    beforeEach(() => {
        initSquares(values);
    });

    test("assign valid digit", () => {
        expect(() => assign(values, square, digit)).not.toThrow();
        expect(values.get(square)).toBe(digit);
    });

    test("assign should not throw on assigning same digit twice", () => {
        assign(values, square, digit);
        expect(() => assign(values, square, digit)).not.toThrow();
        expect(values.get(square)).toBe(digit);
    });

    test("assign should throw on assigning different digits", () => {
        assign(values, square, 3);
        expect(() => assign(values, square, 4)).toThrow(
            "Trying to assign a digit to an already determined square"
        );
    });

    test("assign should throw on assigning digit not contained in possible values", () => {
        values.set(square, [1, 2]);
        expect(() => assign(values, square, 3)).toThrow(
            "Trying to assign a digit not contained in square possible values"
        );
    });

    test("assign should eliminate digit from peers", () => {
        assign(values, square, digit);
        const peers = SQUARE_PEERS.get(square) as Peers;
        peers.forEach((square: Square) => {
            expect(values.get(square)).toEqual(
                expect.not.arrayContaining([digit])
            );
        });
    });

    test.only("assign should resolve digits with a single possible spot", () => {
        // Remove 1 & 2 digits from first line except 2 first squares
        for (let i = 3; i <= 9; ++i) {
            const square = toSquare("A", i as Digit);
            values.set(square, DIGITS.slice(2));
        }
        assign(values, toSquare("A", 2), 2);
        expect(values.get(square)).toBe(1);
    });

    test("eliminate should assign squares with only 1 possible digit", () => {
        values.set(square, [1, 2]);
        eliminate(values, 1, [square]);
        expect(values.get(square)).toBe(2);
    });

    test("eliminate should throw on assigned digits", () => {
        assign(values, square, digit);
        expect(() => eliminate(values, digit, [square])).toThrow(
            "A digit appears twice within a unit"
        );
    });

    test("resolveDigits should throw on unsolvable digits", () => {
        const unit = UNITS[0];
        for (const square of unit) {
            values.set(square, DIGITS.slice(1));
        };
        expect(() => resolveDigits(values, [1], unit)).toThrow(
            "A digit has no valid place within a unit"
        );
    });
});
