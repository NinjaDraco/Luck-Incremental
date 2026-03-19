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

const { formatTime, E } = context;

test('formatTime - 0 seconds', () => {
    assert.strictEqual(formatTime(0), "0.00");
});

test('formatTime - Basic seconds', () => {
    assert.strictEqual(formatTime(1), "1.00");
    assert.strictEqual(formatTime(59), "59.0");
});

test('formatTime - Minutes', () => {
    assert.strictEqual(formatTime(60), "1:00.00");
    assert.strictEqual(formatTime(61), "1:01.00");
    assert.strictEqual(formatTime(3599), "59:59.0");
});

test('formatTime - Hours', () => {
    assert.strictEqual(formatTime(3600), "1:00:00.00");
    assert.strictEqual(formatTime(3661), "1:01:01.00");
    assert.strictEqual(formatTime(86399), "23:59:59.0");
});

test('formatTime - Days', () => {
    assert.strictEqual(formatTime(86400), "1:00:00:00.00");
    assert.strictEqual(formatTime(86461), "1:00:01:01.00");
    assert.strictEqual(formatTime(172800), "2:00:00:00.00");
});

test('formatTime - Accuracy (acc)', () => {
    assert.strictEqual(formatTime(1.234, 1), "1.2");
    assert.strictEqual(formatTime(1.234, 0), "1");
    assert.strictEqual(formatTime(61.234, 1), "1:01.2");
    assert.strictEqual(formatTime(3661.234, 1), "1:01:01.2");
});

test('formatTime - Very large values', () => {
    // 1e10 seconds is 115740 days, 17 hours, 46 minutes, 40 seconds
    assert.strictEqual(formatTime(E(1e10)), "115,740:17:46:40.0");
});

test('formatTime - Forced padding with type parameter', () => {
    assert.strictEqual(formatTime(30, 2, 'd'), "00:00:30.0");
    assert.strictEqual(formatTime(30, 2, 'h'), "00:30.0");
    assert.strictEqual(formatTime(30, 2, 'm'), "30.0");
});

test('formatTime - Boundary padding', () => {
    assert.strictEqual(formatTime(3600 + 60 + 1), "1:01:01.00");
    assert.strictEqual(formatTime(3600 + 10 * 60 + 1), "1:10:01.00");
});
