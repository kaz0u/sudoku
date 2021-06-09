import type { Square } from "./index";
import {
    GRID_SIZE,
    UNITS_SIZE,
    SQUARE_PEERS_SIZE,
    SQUARES,
    ROWS,
    COLS,
    SQUARE_PEERS,
    UNITS,
    toSquare,
    fromSquare
} from "./index";

describe("Sudoku grid definition", () => {
    test("grid should contains 9x9 squares", () => {
        expect(SQUARES.length).toBe(GRID_SIZE);
    });

    test("units should contains 27 elements", () => {
        expect(UNITS.length).toBe(UNITS_SIZE);
    });

    test("peers should contains 20 squares", () => {
        SQUARES.forEach((square: Square) => {
            expect(SQUARE_PEERS.get(square)?.length).toBe(SQUARE_PEERS_SIZE);
        });
    });

    test("peers should not contains key square", () => {
        SQUARES.forEach((square: Square) => {
            expect(SQUARE_PEERS.get(square)).toEqual(
                expect.not.arrayContaining([square])
            );
        });
    });

    test("toSquare", () => {
        expect(toSquare("A", 1)).toBe("A1");
        expect(toSquare("D", 6)).toBe("D6");
        expect(toSquare("I", 9)).toBe("I9");
    });

    test("fromSquare", () => {
        expect(fromSquare("A1")).toEqual([0, 0]);
        expect(fromSquare("D6")).toEqual([3, 5]);
        expect(fromSquare("I9")).toEqual([8, 8]);
    });

    test("toSquare of fromSquare identity", () => {
        SQUARES.forEach((square: Square) => {
            const [rowIndex, colIndex] = fromSquare(square);
            expect(toSquare(ROWS[rowIndex], COLS[colIndex])).toBe(square);
        });
    });
});
