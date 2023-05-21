export const notMatchingCode = `
const foo = 'hello_bg.wasm';
console.log(foo);
`;

export const matchingCode = `
const path = require('path').join(__dirname, 'hello_bg.wasm');
const bytes = require('fs').readFileSync(path);
`;
