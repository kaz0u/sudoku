import { cartesian } from "./index";

describe("Cartesian product", () => {
    test("empty sets", () => {
        expect(cartesian([], [])).toEqual([]);
    });

    test("1st set empty", () => {
        expect(cartesian([], [1, 2, 3])).toEqual([[1], [2], [3]]);
    });

    test("2nd set empty", () => {
        expect(cartesian([1, 2, 3], [])).toEqual([[1], [2], [3]]);
    });

    test("2x3 product", () => {
        expect(cartesian([1, 2], [3, 4, 5])).toEqual([
            [1, 3], [1, 4], [1, 5],
            [2, 3], [2, 4], [2, 5],
        ]);
    });

    test("Mixed types", () => {
        expect(cartesian([1, 2], ["A", "B"])).toEqual([
            [1, "A"], [1, "B"],
            [2, "A"], [2, "B"]
        ]);
    });
});
