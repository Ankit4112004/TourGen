const assert = require('node:assert/strict');
const { toBoundedText } = require('../src/utils/llmOutput');

const nestedReasoning = { summary: 'A'.repeat(240) };
const boundedReasoning = toBoundedText(nestedReasoning, 200);
assert.equal(typeof boundedReasoning, 'string');
assert.equal(boundedReasoning.length, 200);

const boundedWhy = toBoundedText('B'.repeat(151), 150);
assert.equal(boundedWhy.length, 150);

assert.equal(toBoundedText('short explanation', 150), 'short explanation');
assert.equal(toBoundedText(undefined, 150), '');

console.log('llmOutput regression tests passed');
