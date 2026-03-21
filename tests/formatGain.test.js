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

const { formatGain, E } = context;

test('formatGain - Basic gains (amt < 1e100)', () => {
    assert.strictEqual(formatGain(E(10), E(5)), "(+5.00/sec)");
    assert.strictEqual(formatGain(E(100), E(200)), "(+200/sec)");
    assert.strictEqual(formatGain(E(1e50), E(1e50)), "(+100.0 QtDc/sec)");
});

test('formatGain - Large amt, small gain (amt >= 1e100, ooms < 10)', () => {
    // If amt is 1e100, and gain is 1e100, next is 2e100. ooms = 2 < 10.
    assert.strictEqual(formatGain(E(1e100), E(1e100)), "(+1.00e100/sec)");

    // amt is 1e100, gain is 8e100, next is 9e100. ooms = 9 < 10.
    assert.strictEqual(formatGain(E(1e100), E(8e100)), "(+8.00e100/sec)");
});

test('formatGain - OoMs threshold met (amt >= 1e100, ooms >= 10)', () => {
    // amt is 1e100, gain is 9e100. next is 10e100 (1e101). ooms = 10. log10(10) * 20 = 20
    assert.strictEqual(formatGain(E(1e100), E(9e100)), "(+20.0 OoMs/sec)");

    // amt is 1e100, gain is 99e100. next is 100e100 (1e102). ooms = 100. log10(100) * 20 = 40
    assert.strictEqual(formatGain(E(1e100), E(99e100)), "(+40.0 OoMs/sec)");

    // amt is 1e100, gain is 1e200. next is ~1e200. ooms = 1e100. log10(1e100) * 20 = 2000
    assert.strictEqual(formatGain(E(1e100), E(1e200)), "(+2,000 OoMs/sec)");
});

test('formatGain - Edge case: amt is 0', () => {
    // Next is 10, amt is 0. Division by zero results in Infinity (which is >= 10),
    // but amt is not >= 1e100, so it uses the normal format.
    assert.strictEqual(formatGain(E(0), E(10)), "(+10.0/sec)");
});
