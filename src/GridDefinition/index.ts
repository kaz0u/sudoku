import { assert } from "console";
import type { Tuple } from "utils";
import { cartesian } from "../utils";

// Size definitions

export type GridSize = 81;
export type UnitSize = 9;
export type UnitsSize = 27;
export type SquareUnitsSize = 3;
export type SquarePeersSize = 20;

export const GRID_SIZE = 81;
export const UNIT_SIZE = 9;
export const UNITS_SIZE = 27;
export const SQUARE_UNITS_SIZE = 3;
export const SQUARE_PEERS_SIZE = 20;

// Type definitions

type DigitsTuple = typeof DIGITS;
type RowsTuple = typeof ROWS;
export type Digit = DigitsTuple[Exclude<keyof DigitsTuple, keyof number[]>];
export type Row = RowsTuple[Exclude<keyof RowsTuple, keyof string[]>];
export type Col = Digit;
export type Square = `${Row}${Col}`;
export type Unit = Tuple<Square, UnitSize>;
export type Units = Tuple<Unit, UnitsSize>;
export type Peers = Tuple<Square, SquarePeersSize>;
export type SquareUnits = Map<Square, Tuple<Unit, SquareUnitsSize>>;
export type SquarePeers = Map<Square, Peers>;

// Utils

export function toSquare(row: Row, col: Col): Square {
    return `${row}${col}` as Square;
}

export function fromSquare(square: Square): [number, number] {
    return [ROWS.indexOf(square[0] as Row), COLS.indexOf(parseInt(square[1]) as Col)];
}

// Squares

export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;
export const COLS = DIGITS;
export const SQUARES = cartesian(ROWS, COLS).map(([row, col]) => toSquare(row as Row, col as Col));


// Units (sets of 9 squares)

const rowUnits = ROWS.map(row => COLS.map(col => toSquare(row, col))) as Tuple<Unit, 9>;
const colUnits = COLS.map(col => ROWS.map(row => toSquare(row, col))) as Tuple<Unit, 9>;
const boxUnits = (() => {
    const units = [];
    for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 3; ++j) {
            units.push(
                cartesian(
                    ROWS.slice(3 * i, 3 * (i + 1)),
                    DIGITS.slice(3 * j, 3 * (j + 1))
                ).map(([row, col]) => toSquare(row as Row, col as Col))
            );
        }
    }
    return units as Tuple<Unit, 9>;
})();
export const UNITS: Units = [...rowUnits, ...colUnits, ...boxUnits];

// Square maps

export const SQUARE_UNITS: SquareUnits = new Map();
export const SQUARE_PEERS: SquarePeers = new Map();
SQUARES.forEach((square: Square) => {
    const [row, col] = fromSquare(square);
    SQUARE_UNITS.set(square, [
        rowUnits[row],
        colUnits[col],
        boxUnits[3 * Math.floor(row / 3) + Math.floor(col / 3)]
    ]);
    const peers = new Set<Square>(SQUARE_UNITS.get(square)?.flat());
    peers.delete(square); // do not include current square in peers
    SQUARE_PEERS.set(square, Array.from(peers) as Peers);
});

// Type guards

export function isValidDigit(digit: number): digit is Digit {
    return (DIGITS as readonly number[]).includes(digit);
}

export function isValidRow(row: string): row is Row {
    return (ROWS as readonly string[]).includes(row);
}

export function isValidCol(col: number): col is Col {
    return (COLS as readonly number[]).includes(col);
}

export function isValidSquare(square: string): square is Square {
    return (SQUARES as readonly string[]).includes(square);
}