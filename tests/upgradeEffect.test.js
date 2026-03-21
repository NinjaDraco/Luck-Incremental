const fs = require('fs');
const path = require('path');
const vm = require('vm');
const test = require('node:test');
const assert = require('node:assert');

const breakEternityPath = path.join(__dirname, '../js/break_eternity.js');
const formatPath = path.join(__dirname, '../js/format.js');
const savesPath = path.join(__dirname, '../js/saves.js');
const upgsPath = path.join(__dirname, '../js/upgs.js');

const breakEternityCode = fs.readFileSync(breakEternityPath, 'utf8');
const formatCode = fs.readFileSync(formatPath, 'utf8');
const savesCode = fs.readFileSync(savesPath, 'utf8');
const upgsCode = fs.readFileSync(upgsPath, 'utf8');

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
    tmp: {}, // Mock tmp
    player: {}, // Mock player, needed for UPGRADES initialization
    document: { getElementById: () => ({}) }, // Mock DOM, just in case
    window: { crypto: { getRandomValues: () => {} } }, // Mock crypto
};

vm.createContext(context);
vm.runInContext(breakEternityCode, context);
vm.runInContext(`function formatMult(a) { return "x"+a; }`, context); // Mock format function
vm.runInContext(`function formatPercent(a) { return (a*100)+"%"; }`, context); // Mock format function
vm.runInContext(`function format(a,b,c) { return a.toString(); }`, context); // Mock format function
vm.runInContext(`var tmp_update = [];`, context); // Mock tmp_update list
vm.runInContext(`var el = { setup: {}, update: {} };`, context); // Mock el list
vm.runInContext(`var tab = 0;`, context);
vm.runInContext(`var Element = function(id) { this.id = id; this.setHTML = () => {}; this.setDisplay = () => {}; this.setClasses = () => {}; }`, context);

// We only need upgradeEffect from upgsCode. We can run upgsCode in context
// But since upgsCode initializes UPGRADES which references E(), we need to make sure savesCode is run first.
vm.runInContext(savesCode, context);
vm.runInContext(upgsCode, context);

const { upgradeEffect, tmp, E } = context;

test('upgradeEffect - returns default when tmp.upgs is undefined', () => {
    tmp.upgs = undefined;
    assert.strictEqual(upgradeEffect('pp', 0), 1);
});

test('upgradeEffect - returns custom default when tmp.upgs is undefined', () => {
    tmp.upgs = undefined;
    assert.strictEqual(upgradeEffect('pp', 0, 5), 5);
});

test('upgradeEffect - returns default when tmp.upgs[id] is undefined', () => {
    tmp.upgs = { tp: { effect: [10, 20] } };
    assert.strictEqual(upgradeEffect('pp', 0), 1);
});

test('upgradeEffect - returns default when tmp.upgs[id].effect is undefined', () => {
    tmp.upgs = { pp: { res: 100 } };
    assert.strictEqual(upgradeEffect('pp', 0), 1);
});

test('upgradeEffect - returns default when tmp.upgs[id].effect[i] is undefined', () => {
    tmp.upgs = { pp: { effect: [5] } };
    assert.strictEqual(upgradeEffect('pp', 1), 1);
});

test('upgradeEffect - returns correct effect value when it exists', () => {
    tmp.upgs = { pp: { effect: [10, 20, 30] } };
    assert.strictEqual(upgradeEffect('pp', 1), 20);
});

test('upgradeEffect - returns correct effect value (can be an array)', () => {
    tmp.upgs = { pp: { effect: [[2, 4], [3, 9]] } };
    assert.deepStrictEqual(upgradeEffect('pp', 0), [2, 4]);
});

test('upgradeEffect - returns correct effect value (can be a Decimal object)', () => {
    const val = E(1e10);
    tmp.upgs = { pp: { effect: [val] } };
    assert.strictEqual(upgradeEffect('pp', 0).eq(val), true);
});
