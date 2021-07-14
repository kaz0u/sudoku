import { declareError } from "utils";

export enum GridErrorType {
    AssignAlreadySet = "Trying to assign a digit to an already determined square",
    AssignInvalidDigit = "Trying to assign a digit not contained in square possible values",
    UnitDuplicate = "A digit appears twice within a unit",
    UnsolvableDigit = "A digit has no valid place within a unit",
    NoUniqueSolution = "Grid does not fullfill conditions to may have a unique solution",
}

export const GridError = declareError(
    "GridError",
    function (type: GridErrorType): string {
        return type;
    }
);