import { table as Table } from "table";
import * as colors from "colors";

// @ts-ignore
import * as cloneDeep from "lodash.clonedeep";

export const utils = {
    /**
     * Use map instead of just `fill` because `fill` fill the array with same value reference (change to item 1 will cause change to item 2)
     */
    fillArray: (size: number, { value, fn }: {value?: any, fn?: () => any}) =>
        new Array(size).fill(0).map((_) => fn ? fn() : value),

    createIncreasingArray: (from: number, to: number): number[] => {
        const arr: number[] = [];

        for (let i: number = from; i <= to; i++) {
            arr.push(i);
        }

        return arr;
    },
};

/**
 * Z class for Z_n
 */
export class Z {
    /**
     * Computation Table
     */
    private _table: {addition?: number[][], multiply?: number[][]} = {};

    /**
     * Variables in the Z
     */
    private _variables: number[] = [];

    /**
     * Variables length
     */
    private _n: number = 0;

    private _field: Field;

    constructor(variables: number[]) {
        if (!variables || !Array.isArray(variables) || variables.length === 0) {
            throw new Error(
                "`variables` must be provided and be an array with at least 1 element",
            );
        }

        this._variables = variables;

        // Sort from lowest to highest.
        this._variables.sort((a, b) => a - b);
        this._n = this._variables.length;

        this._table = {
            addition: Z.operationTable(this._variables, this.sum),
            multiply: Z.operationTable(this._variables, this.multiply),
        };

        this._field = {
            sum: this.sum,
            multiply: this.multiply,
            f0: 0,
            f1: 1,

            // @ts-ignore
            getInverseVariable: this.findInverseVariable,
            // @ts-ignore
            getAdditiveInverseVariable: this.findAdditiveInverseVariable
        };
    }

    static createFromRange = (from, to) =>
        new Z(utils.createIncreasingArray(from, to));

    static createFromN = (n) => new Z(utils.createIncreasingArray(0, n - 1));

    /**
     * Z_n Sum (a +_n b)
     * @example For n = 7, a = b = 5, the result will be 3
     */
    sum = (a: number, b: number): number => Z.sum(this._n, a, b);

    /**
     * Z_n Sum (a +_n b)
     * @example For n = 7, a = b = 5, the result will be 3
     */
    static sum = (n: number, a: number, b: number): number => (a + b) % n;

    /**
     * Z_n Multiply (a *_n b)
     * @example For n = 7, a = b = 5, the result will be 4
     */
    multiply = (a: number, b: number): number => Z.multiply(this._n, a, b);

    /**
     * Z_n Multiply (a *_n b)
     * @example For n = 7, a = b = 5, the result will be 4
     */
    static multiply = (n: number, a: number, b: number): number => (a * b) % n;

    static operationTable = (variables, operation) => {
        if (!variables || !Array.isArray(variables) || variables.length === 0) {
            throw new Error(
                "`variables` must be provided and be an array with at least 1 element",
            );
        }

        if (!operation || typeof operation !== "function") {
            throw new Error("`operation` must be provided and be a function type");
        }

        const n = variables.length;

        // n + 1 to add place for headers
        const matrix = utils.fillArray(n, { fn: () => utils.fillArray(n, {value: 0}) });

        // Sort from lowest to highest.
        variables.sort((a, b) => a - b);

        // Set headers
        for (let i = 0; i < n; i++) {
            for (let j = i; j < n; j++) {
                // because a * b === b * a
                matrix[i][j] = matrix[j][i] = operation(i, j);
            }
        }

        return matrix;
    };

    /**
     * Get the inverse number (האיבר ההופכי) for the provided variable
     * @param {number} variable number to get the inverse number for
     * @return {number} inverse number
     * @summary x * x^(-1) = 1
     */
    findInverseVariable = (variable: number): number | undefined => {
        if (!variable || variable === 0) {
            throw new Error("`variable` must be provided and must not be equal to 0");
        }

        if (!this._variables.includes(variable)) {
            throw new Error("`variables` not include the provided `variable`");
        }

        const varIndex = this._variables.indexOf(variable);

        const inverseVarIndex = this._table.multiply ? this._table.multiply[varIndex].findIndex(
            (multiplyResult) => multiplyResult === 1,
        ) : -1;

        return inverseVarIndex === -1
            ? undefined
            : this._variables[inverseVarIndex];
    };

    findAllInverseVariables = (): {variable: number, inverse: number | undefined}[] =>
        this._variables.filter((item) => item !== 0).map((variable) => ({
            variable,
            inverse: this.findInverseVariable(variable),
        }));

    /**
     * Get the Additive inverse number (האיבר הנגדי) for the provided variable
     * @param {number} variable number to get the Additive inverse number for
     * @summary x + (-x) = 0
     */
    findAdditiveInverseVariable = (variable: number): number | undefined => {
        if (!variable && variable !== 0) {
            throw new Error("`variable` must be provided");
        }

        if (!this._variables.includes(variable)) {
            throw new Error("`variables` not include the provided `variable`");
        }

        const varIndex = this._variables.indexOf(variable);

        const additiveInverseVarIndex = this._table.addition ? this._table.addition[varIndex].findIndex(
            (multiplyResult) => multiplyResult === 0,
        ) : -1;

        return additiveInverseVarIndex === -1
            ? undefined
            : this._variables[additiveInverseVarIndex];
    };

    findAllAdditiveInverseVariables = (): { variable: number, additiveInverse: number | undefined}[] =>
        this._variables.map((variable) => ({
            variable,
            additiveInverse: this.findAdditiveInverseVariable(variable),
        }));

    getAllVariablesData = (formatted = true) => {
        const variablesData = this._variables.map((variable) => ({
            variable,
            additiveInverse: this.findAdditiveInverseVariable(variable),
            inverse: variable !== 0 ? this.findInverseVariable(variable) : undefined,
        }));

        if (!formatted) {
            return variablesData;
        }

        const table = [
            [
                "Number",
                "נגדי".split("").reverse().join(""),
                "הופכי".split("").reverse().join(""),
            ],
            ...(variablesData.map((
                { variable, inverse, additiveInverse },
            ) => [variable, additiveInverse, inverse])),
        ];

        return Table(table);
    };

    getAdditionTable(formatted = true) {
        const sumTable = cloneDeep(this._table.addition);

        return formatted ? Z.formatTable(sumTable, this._variables) : sumTable;
    }

    getMultiplyTable(formatted = true) {
        const mulTable = cloneDeep(this._table.multiply);

        return formatted ? Z.formatTable(mulTable, this._variables) : mulTable;
    }

    static formatTable(table, variables) {
        if (!table || !Array.isArray(table) || table.length === 0) {
            throw new Error(
                "`table` must be provided and be an array with at least 1 element",
            );
        }

        if (!variables || !Array.isArray(variables) || variables.length === 0) {
            throw new Error(
                "`variables` must be provided and be an array with at least 1 element",
            );
        }

        const n = variables.length;

        // Add header row
        table.unshift(["", ...(variables.map((item) => colors.bold(item)))]);

        // Add header column
        for (let i = 1; i <= n; i++) {
            table[i].unshift(colors.bold(variables[i - 1]));
        }

        return Table(table);
    }

    isField() {
        // TODO - Check if the variables are fields by the axioms
    }

    get field(): Field {
        return this._field;
    }

    getFVar(initialValue: number): FVar {
        return new FVar(initialValue, this.field);
    }
}

export interface Field {
    sum(x: number, y: number): number;

    multiply(x: number, y: number): number;

    f0: number;
    f1: number;

    /**
     * Get the inverse number (האיבר ההופכי) for the provided variable (x^(-1))
     * @param {number} variable number to get the inverse number for
     * @return {number} inverse number
     * @summary x * x^(-1) = 1
     */
    getInverseVariable(x: number): number;

    /**
     * Get the Additive inverse number (האיבר הנגדי) for the provided variable (-x)
     * @param {number} variable number to get the Additive inverse number for
     * @summary x + (-x) = 0
     */
    getAdditiveInverseVariable(x: number): number;
}

export class FVar {
    private _field: Field;

    private _value: number;

    constructor(initialValue: number, field: Field) {
        if (initialValue == null || !field) {
            throw new Error("`initialValue` and `field` are required.");
        }

        this._value = initialValue;
        this._field = field;
    }

    setValueToF0(): this {
        this._value = this._field.f0;
        return this;
    }

    setValueToF1(): this {
        this._value = this._field.f1;
        return this;
    }

    /**
     * Addition
     * @param {number} addition Addition number
     * @return {this}
     */
    sum(addition: number): this {
        if (!addition && addition !== 0) {
            throw new Error("`addition` must be provided.");
        }

        this._value = this._field.sum(this._value, addition);
        return this;
    }

    /**
     * Subtraction
     * @param {number} subtrahend The number to subtract by
     * @return {this}
     */
    subtract(subtrahend: number): this {
        if ((!subtrahend && subtrahend !== 0)) {
            throw new Error("`subtrahend` must be provided.");
        }

        // x - y = x + (-y)
        this._value = this._field.sum(this._value, this._field.getAdditiveInverseVariable(subtrahend));
        return this;
    }

    /**
     * Multiplication
     * @param {number} multiplier the multiplier to multiply by.
     * @return {this}
     */
    multiply(multiplier: number): this {
        if (!multiplier && multiplier !== 0) {
            throw new Error("`multiplier` must be provided.");
        }
        this._value = this._field.multiply(this._value, multiplier);
        return this;
    }

    /**
     * Division
     * @param {number} divisor The number to divide by
     * @return {this}
     */
    divide(divisor: number): this {
        if ((!divisor && divisor !== 0) || divisor === this._field.f0) {
            throw new Error("`divisor` must be provided and can't be f0.");
        }

        // x / y = x * (y ^ (-1)) 
        this._value = this._field.multiply(this._value, this._field.getInverseVariable(divisor));
        return this;
    }

    clone(): FVar {
        return new FVar(this._value, this._field);
    }

    get value(): number {
        return this._value;
    }
}


