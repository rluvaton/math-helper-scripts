import {Z} from './linear-algebra';

console.log(
    Z.sum(7, 5, 5),
    Z.multiply(7, 6, 1),
);

const z7 = Z.createFromN(7);
console.log(z7.getAdditionTable());
console.log(z7.getAllVariablesData());

const z4 = Z.createFromN(4);
console.log(z4.getAdditionTable());
console.log(z4.getAllVariablesData());

const z9 = Z.createFromN(9);
console.log(z9.getAllVariablesData());

console.log(Z.createFromN(5).getFVar(2).divide(3).subtract(1).value);