const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');
const Parser = acorn.Parser.extend(jsx());

const code = fs.readFileSync('test.jsx', 'utf-8');
try {
  Parser.parse(code, { sourceType: 'module', ecmaVersion: 2020 });
  console.log("No syntax errors found!");
} catch (e) {
  console.error(e);
}
