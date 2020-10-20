import { table as Table } from 'table';
import colors from 'colors';
import cloneDeep from 'lodash.clonedeep';

export const utils = {

    /**
     * Use map instead of just `fill` because `fill` fill the array with same value reference (change to item 1 will cause change to item 2)
     */
    fillArray: (size, { value, fn }) => new Array(size).fill(0).map(_ => fn ? fn() : value),

    createIncreasingArray: (from, to) => {
        const arr = [];

        for (let i = from; i <= to; i++) {
            arr.push(i);
        }

        return arr;
    }
}

/**
 * Z class for Z_n
 */
export class Z {
    /**
     * Computation Table
     * @type {{addition: number[][], multiply: number[][]}}
     */
    #table = {};

    /**
     * Variables in the Z
     * @type {number[]}}
     */
    #variables = [];

    /**
     * Variables length
     * @type {number}
     */
    #n = 0;

    constructor(variables) {
        if (!variables || !Array.isArray(variables) || variables.length === 0) {
            throw new Error('`variables` must be provided and be an array with at least 1 element');
        }

        // Sort from lowest to highest.
        this.#variables = variables.sort((a, b) => a - b);
        this.#n = this.#variables.length;

        this.#table = {
            addition: Z.operationTable(this.#variables, this.sum),
            multiply: Z.operationTable(this.#variables, this.multiply)
        };
    }

    static createFromRange = (from, to) => new Z(utils.createIncreasingArray(from, to));

    static createFromN = (n) => new Z(utils.createIncreasingArray(0, n - 1));

    /**
     * Z_n Sum (a +_n b)
     * @param {number} a
     * @param {number} b
     * @return {number}
     * @example For n = 7, a = b = 5, the result will be 3
     */
    sum = (a, b) => Z.sum(this.#n, a, b);

    /**
     * Z_n Sum (a +_n b)
     * @param {number} n
     * @param {number} a
     * @param {number} b
     * @return {number}
     * @example For n = 7, a = b = 5, the result will be 3
     */
    static sum = (n, a, b) => (a + b) % n;

    /**
     * Z_n Multiply (a *_n b)
     * @param {number} a
     * @param {number} b
     * @return {number}
     * @example For n = 7, a = b = 5, the result will be 4
     */
    multiply = (a, b) => Z.multiply(this.#n, a, b);

    /**
     * Z_n Multiply (a *_n b)
     * @param {number} n
     * @param {number} a
     * @param {number} b
     * @return {number}
     * @example For n = 7, a = b = 5, the result will be 4
     */
    static multiply = (n, a, b) => (a * b) % n;

    static operationTable = (variables, operation) => {
        if (!variables || !Array.isArray(variables) || variables.length === 0) {
            throw new Error('`variables` must be provided and be an array with at least 1 element');
        }

        if (!operation || typeof operation !== 'function') {
            throw new Error('`operation` must be provided and be a function type');
        }

        const n = variables.length;

        // n + 1 to add place for headers
        const matrix = utils.fillArray(n, { fn: () => utils.fillArray(n, 0) });

        // Sort from lowest to highest.
        variables = variables.sort((a, b) => a - b);

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
    findInverseVariable = (variable) => {
        if (!variable || variable === 0) {
            throw new Error('`variable` must be provided and must not be equal to 0');
        }

        if (!this.#variables.includes(variable)) {
            throw new Error('`variables` not include the provided `variable`');
        }

        const varIndex = this.#variables.indexOf(variable);

        const inverseVarIndex = this.#table.multiply[varIndex].findIndex(multiplyResult => multiplyResult === 1);
        return inverseVarIndex === -1 ? undefined : this.#variables[inverseVarIndex];
    }

    findAllInverseVariables = () => this.#variables.filter(item => item !== 0).map(variable => ({ variable, reverse: this.findInverseVariable(variable) }))

    /**
     * Get the Additive inverse number (האיבר הנגדי) for the provided variable
     * @param {number} variable number to get the Additive inverse number for
     * @summary x + (-x) = 0
     */
    findAdditiveInverseVariable = (variable) => {
        if (!variable && variable !== 0) {
            throw new Error('`variable` must be provided');
        }

        if (!this.#variables.includes(variable)) {
            throw new Error('`variables` not include the provided `variable`');
        }

        const varIndex = this.#variables.indexOf(variable);

        const additiveInverseVarIndex = this.#table.addition[varIndex].findIndex(multiplyResult => multiplyResult === 0);
        return additiveInverseVarIndex === -1 ? undefined : this.#variables[additiveInverseVarIndex];
    }

    findAllAdditiveInverseVariables = () => this.#variables.map(variable => ({ variable, opposite: this.findAdditiveInverseVariable(variable) }))

    getAllVariablesData = (formatted = true) => {
        const variablesData = this.#variables.map(variable => ({
            variable,
            additiveInverse: this.findAdditiveInverseVariable(variable),
            inverse: variable !== 0 ? this.findInverseVariable(variable) : undefined
        }));

        if (!formatted) {
            return variablesData
        }

        const table = [
            ['Number', 'נגדי'.split('').reverse().join(''), 'הופכי'.split('').reverse().join('')],
            ...(variablesData.map(({ variable, inverse, additiveInverse }) => [variable, additiveInverse, inverse]))
        ];

        return Table(table)
    }

    getAdditionTable(formatted = true) {
        const sumTable = cloneDeep(this.#table.addition);

        return formatted ? Z.formatTable(sumTable, this.#variables) : sumTable;
    }

    getMultiplyTable(formatted = true) {
        const mulTable = cloneDeep(this.#table.multiply);

        return formatted ? Z.formatTable(mulTable, this.#variables) : mulTable;
    }

    static formatTable(table, variables) {
        if (!table || !Array.isArray(table) || table.length === 0) {
            throw new Error('`table` must be provided and be an array with at least 1 element');
        }

        if (!variables || !Array.isArray(variables) || variables.length === 0) {
            throw new Error('`variables` must be provided and be an array with at least 1 element');
        }

        const n = variables.length;

        // Add header row
        table.unshift(['', ...(variables.map(item => colors.bold(item)))]);

        // Add header column
        for (let i = 1; i <= n; i++) {
            table[i].unshift(colors.bold(variables[i - 1]));
        }

        return Table(table);
    }
}
