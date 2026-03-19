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

const { formatPercent, E } = context;

test('formatPercent - Basic values', () => {
    assert.strictEqual(formatPercent(0), "0.00%");
    assert.strictEqual(formatPercent(1), "100%");
    assert.strictEqual(formatPercent(0.5), "50.0%");
    assert.strictEqual(formatPercent(0.05), "5.00%");
    assert.strictEqual(formatPercent(1.234), "123%");
});

test('formatPercent - String inputs', () => {
    assert.strictEqual(formatPercent("0"), "0.00%");
    assert.strictEqual(formatPercent("1"), "100%");
    assert.strictEqual(formatPercent("0.5"), "50.0%");
});

test('formatPercent - Decimal objects inputs', () => {
    assert.strictEqual(formatPercent(E(0)), "0.00%");
    assert.strictEqual(formatPercent(E(1)), "100%");
    assert.strictEqual(formatPercent(E(0.5)), "50.0%");
    assert.strictEqual(formatPercent(E(1.234)), "123%");
});

test('formatPercent - Negative values', () => {
    assert.strictEqual(formatPercent(-1), "-100%");
    assert.strictEqual(formatPercent(-0.5), "-50.0%");
    assert.strictEqual(formatPercent("-0.05"), "-5.00%");
    assert.strictEqual(formatPercent(E(-1.234)), "-123%");
});

test('formatPercent - Large numbers', () => {
    assert.strictEqual(formatPercent(1e6), "100,000,000%");
    assert.strictEqual(formatPercent(1e8), "10.00 B%");
    assert.strictEqual(formatPercent(E("1e10")), "1.000 T%");
    assert.strictEqual(formatPercent(E("1e100")), "1.00e102%");
});

test('formatPercent - Very small numbers', () => {
    assert.strictEqual(formatPercent(1e-4), "0.01%");
    assert.strictEqual(formatPercent(1e-5), "1.00e-3%");
    assert.strictEqual(formatPercent(E("1e-10")), "1.00e-8%");
});
