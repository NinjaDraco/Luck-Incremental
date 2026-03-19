const fs = require('fs');
const path = require('path');
const vm = require('vm');
const test = require('node:test');
const assert = require('node:assert');

const breakEternityPath = path.join(__dirname, '../js/break_eternity.js');
const savesPath = path.join(__dirname, '../js/saves.js');
const formatPath = path.join(__dirname, '../js/format.js');

const breakEternityCode = fs.readFileSync(breakEternityPath, 'utf8');
const savesCode = fs.readFileSync(savesPath, 'utf8');
const formatCode = fs.readFileSync(formatPath, 'utf8');

const context = {
    console,
    Math,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    parseInt,
    parseFloat,
    isNaN,
    Infinity,
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
};

vm.createContext(context);
vm.runInContext(breakEternityCode, context);
vm.runInContext(savesCode, context);
vm.runInContext(formatCode, context);

const { formatReduction, E } = context;

test('formatReduction - Basic fractions', () => {
    assert.strictEqual(formatReduction(0.5), "50.0%");
    assert.strictEqual(formatReduction(0.25), "75.0%");
    assert.strictEqual(formatReduction(0.75), "25.0%");
});

test('formatReduction - Boundaries', () => {
    assert.strictEqual(formatReduction(0), "100%");
    assert.strictEqual(formatReduction(1), "0.00%");
});

test('formatReduction - Extreme values', () => {
    assert.strictEqual(formatReduction(0.99), "1.00%");
    assert.strictEqual(formatReduction(0.999), "0.10%");
    assert.strictEqual(formatReduction(0.01), "99.0%");
});

test('formatReduction - Outside normal bounds', () => {
    assert.strictEqual(formatReduction(1.5), "-50.0%");
    assert.strictEqual(formatReduction(-0.5), "150%");
});
