/**
 * Compute !<number> 
 * @param {number} num Number
 * @return {number} !num 
 */
export function factorial(num) {
    // עצרת - !
    if (num < 0) {
        throw new Error("Number must be >= 0");
    }
    switch (num) {
        case 0:
        case 1:
            return 1;
        case 2:
            return 2;
        default:
            return num * factorial(num - 1);
    }
}

export function binom(n, k) {
    if (n === undefined || k === undefined) {
        throw new Error('n and k must be provided');
    }
    // צירופים
    // ( n )
    // ( k )
    return factorial(n) / (factorial(k) * factorial(n - k));
}

export function P(n, ...k) {
    if (n === undefined) {
        throw new Error('`n` must be provided');
    }

    if (k.length === 0) {
        // תמורות
        // P(n, n)
        k = [n];
    }

    if (k.length === 1) {
        // חליפות
        // P(n, k) = (n! / (n - k)!)
        return factorial(n) / factorial(n - k);
    }

    // תמורה עם חזרות
    return factorial(n) / k.reduce((sum, value) => sum + factorial(value), 0);
}

export function D(n, k) {
    if (n === undefined || k === undefined) {
        throw new Error('n and k must be provided');
    }

    // צירופים עם חזרות
    // ( n  + k - 1)
    // ( k )
    return binom(n + k - 1, k);
}

export function sum(from, to, fn) {
    if (from === undefined || to === undefined || fn === undefined) {
        throw new Error('`from`, `to` and `fn` must be provided');
    }

    if (from > to) {
        throw new Error('`to` can\'t be greater than `from`');
    }

    let value = 0;
    for (let i = from; i <= to; i++) {
        value += fn(i);
    }

    return value;
}

console.log(
    P(5, 2, 1, 1, 1)*3 +
    P(5, 2, 2, 1) * 2 +
    P(5, 1, 1, 1, 1, 1),
    sum(0, 5, (i) => P(5, i)),
    Math.pow()
)
