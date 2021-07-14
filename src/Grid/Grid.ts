import type { Tuple } from "utils";
import type { Square, Digit, Unit, Peers, SquareUnitsSize } from "../GridDefinition";
import {
    GRID_SIZE,
    SQUARES,
    DIGITS,
    SQUARE_UNITS,
    SQUARE_PEERS,
    ROWS,
    COLS,
    toSquare,
    isValidDigit,
    isValidSquare
} from "../GridDefinition";
import { InvalidArgument } from "utils";
import { GridErrorType, GridError } from "./GridError";

export type PossibleValues = Digit | Digit[];
export type ValuesMap = Map<Square, PossibleValues>;
export type ReadonlyValuesMap = ReadonlyMap<Square, PossibleValues>;

export function isValueSet(values: PossibleValues): values is Digit {
    return !(values instanceof Array);
}

/**
 * Init square possible values to all possible digits.
 */
export function initSquares(values: ValuesMap) {
    SQUARES.forEach((square: Square) => {
        values.set(square, DIGITS.slice());
    });
}

/**
 * Assign a specific value to a square and verify constraints.
 * @throws {GridError} Grid contraints are not met.
 */
export function assign(values: ValuesMap, square: Square, digit: Digit) {
    const previousValues = values.get(square) as PossibleValues;
    if (isValueSet(previousValues)) {
        if (previousValues === digit) {
            return;
        } else {
            throw new GridError(GridErrorType.AssignAlreadySet);
        }
    } else if (!previousValues.includes(digit)) {
        throw new GridError(GridErrorType.AssignInvalidDigit);
    }

    values.set(square, digit);
    const peers = SQUARE_PEERS.get(square) as Peers;
    eliminate(values, digit, peers);
    const otherValues = previousValues.filter(value => value !== digit);
    for (const unit of SQUARE_UNITS.get(square) as Tuple<Unit, SquareUnitsSize>) {
        resolveDigits(values, otherValues, unit);
    }
}

/**
 * Eliminate digit within possible values of every peer squares.
 */
export function eliminate(values: ValuesMap, digit: Digit, peers: Square[]) {
    peers.forEach((square: Square) => {
        const digits = values.get(square) as PossibleValues;
        if (isValueSet(digits)) {
            if (digits === digit) {
                throw new GridError(GridErrorType.UnitDuplicate);
            }
        } else {
            const index = digits.indexOf(digit);
            if (index !== -1) {
                digits.splice(index, 1);
                if (digits.length === 1) {
                    assign(values, square, digits[0]);
                }
            }
        }
    });
}

/**
 * Look for digits that can be found within possible values of a single square
 * within a unit and assign them.
 * @param digits Set of digits to look for
 */
export function resolveDigits(values: ValuesMap, digits: Digit[], unit: Unit) {
    digits.forEach((digit: Digit) => {
        let candidate: Square | undefined;
        for (const square of unit) {
            const digits = values.get(square) as PossibleValues;
            if (isValueSet(digits)) {
                if (digits === digit)
                    return;
            } else if (digits.includes(digit)) {
                if (candidate !== undefined)
                    return;
                candidate = square;
            }
        }

        if (candidate === undefined) {
            throw new GridError(GridErrorType.UnsolvableDigit);
        }
        assign(values, candidate, digit);
    });
}

/**
 * @returns a deep clone of possible digits
 */
export function cloneValues(values: ValuesMap) {
    const clone: ValuesMap = new Map();
    for (const [square, digits] of values.entries()) {
        clone.set(square, isValueSet(digits) ? digits : digits.slice());
    }
    return clone;
}

export class Grid {
    private values_: ValuesMap = new Map();

    /**
     * Parse grid from string and verify constraints.
     * @param data on line string of 9x9 characters. Unknowns are '0' or '.'.
     * @throws {InvalidArgument} data length not equal to grid size.
     * @throws {InvalidArgument} data contains invalid char.
     * @throws {GridError} Grid contraints are not met.
     */
    public parse(data: string) {
        if (data.length !== GRID_SIZE) {
            throw new InvalidArgument("data", `length is ${data.length}, expected ${GRID_SIZE}`);
        }

        initSquares(this.values_);

        for (let i = 0; i < 9; ++i) {
            for (let j = 0; j < 9; ++j) {
                const char = data[9 * i + j];
                if (char === "." || char === "0") {
                    continue;
                } else {
                    const digit = parseInt(char);
                    if (!isValidDigit(digit)) {
                        throw new InvalidArgument(
                            "data",
                            `invalid character ${char}, expected one of ${["0", ".", ...DIGITS].join(",")}`
                        );
                    }

                    this.assign(toSquare(ROWS[i], COLS[j]), digit);
                }
            }
        }
    }

    /**
     * @return grid as a one-line string with specified unknown token.
     */
    public toString(unknownToken: "." | "0" = "."): string {
        return Array.from(this.values_.values()).map(digits => {
            return isValueSet(digits) ? digits : unknownToken;
        }).join("");
    }

    public get values(): ReadonlyValuesMap {
        return this.values_;
    }

    /**
     * Assign a specific value to a square and verify constraints.
     * @throws {InvalidArgument} invalid square.
     * @throws {GridError} Grid contraints are not met.
     */
    public assign(square: Square, digit: Digit) {
        if (!isValidSquare(square)) {
            throw new InvalidArgument("square");
        }

        assign(this.values_, square, digit);
    }

    public isSolved() {
        return Array.from(this.values_.values()).every(digits => isValueSet(digits));
    }

    /**
     * Solve Sudoku using backward search.
     * @throws {GridError} Grid does not fullfill conditions to may have a unique solution.
     * @returns True if success
     */
    public solve() {
        if (!this.mayHaveUniqueSolution()) {
            throw new GridError(GridErrorType.NoUniqueSolution);
        }
        return this.solve_(this.values_);
    }

    /**
     * If grid has less than 17 known squares or less than 8 different known digits, solution is not unique.
     * @returns False if grid has several solutions, True if grid might have unique solution
     */
    public mayHaveUniqueSolution() {
        let nbSquareSet = 0;
        const differentDigits: Set<Digit> = new Set();
        for (const [square, digits] of this.values_.entries()) {
            if (isValueSet(digits)) {
                ++nbSquareSet;
                differentDigits.add(digits);
            }
        }
        return nbSquareSet >= 17 && differentDigits.size >= 8;
    }

    /**
     * Solve Sudoku using backward search, prioritize square with the least possible digits.
     */
    private solve_(values: ValuesMap): boolean {
        let minEntry: [Square, Digit[]] | undefined;
        values.forEach((digits, square) => {
            if (!isValueSet(digits)) {
                if (!minEntry || digits.length < minEntry[1].length) {
                    minEntry = [square, digits];
                }
            }
        });

        if (!minEntry) { // All values are set, grid is solved
            this.values_ = values;
            return true;
        } else {
            const [square, digits] = minEntry;
            return digits.some(digit => {
                try {
                    const clonedValues = cloneValues(values);
                    assign(clonedValues, square, digit);
                    return this.solve_(clonedValues);
                } catch (_) {
                    return false;
                }
            });
        }
    }
}