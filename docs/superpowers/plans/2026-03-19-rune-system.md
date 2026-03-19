# Rune System Implementation Plan (V2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a permanent Rune tab with Pokemon-style pack opening, absolute cost scaling, and stat-boosting upgrades.

**Architecture:**
- **Data**: New `player.runes` object in `js/saves.js`.
- **Logic**: New `js/runes.js` for pack opening, rarity rolling, and absolute cost math.
- **UI**: New tab in `index.html`, integrated via `js/tab.js` (handling index 7 for settings).
- **Balance**: Absolute cost scaling (1.5x-2.0x per level) and time-gated pack opening (30s base).

---

### Task 1: Data Initialization
**Files:**
- Modify: `js/saves.js`

- [ ] **Step 1: Add Rune data to the default player object.**
```javascript
// Inside getPlayerData()
runes: {
    unl: false,
    packs: {
        pp: { lvl: E(0), progress: E(0), opening: false },
        tp: { lvl: E(0), progress: E(0), opening: false },
        rp: { lvl: E(0), progress: E(0), opening: false },
    },
    upgs: {
        speed: E(0),
        bulk: E(0),
        clone: E(0),
        luck: E(0),
    },
    items: {
        pp_add: E(0), pp_mult: E(1), pp_exp: E(1),
        tp_add: E(0), tp_mult: E(1), tp_exp: E(1),
        rp_add: E(0), rp_mult: E(1), rp_exp: E(1),
    }
}
```
- [ ] **Step 2: Commit.**
```bash
git add js/saves.js
git commit -m "feat: add v2 runes data structure to saves"
```

---

### Task 2: Core Rune Logic
**Files:**
- Create: `js/runes.js`
- Modify: `index.html`

- [ ] **Step 1: Add script tag to `index.html`.** Add `<script src="js/runes.js"></script>` before `js/main.js`.
- [ ] **Step 2: Implement `RUNES` object in `js/runes.js`.**
- Define `RUNES.packs` with absolute scaling: `1e20 * 1.5^lvl` (PP), `1e15 * 1.8^lvl` (TP), `1e10 * 2.0^lvl` (RP).
- Implement `RUNES.update(diff)` to handle time-gated opening (30s base / speed effect).
- [ ] **Step 3: Implement `rollRune(packType)` logic.**
- Use `RuneLuck` and `RuneBulk` for random rolls.
- [ ] **Step 4: Commit.**
```bash
git add js/runes.js index.html
git commit -m "feat: implement rune logic and opening loop"
```

---

### Task 3: Tab & Gain Integration
**Files:**
- Modify: `js/tab.js`, `js/main.js`, `index.html`

- [ ] **Step 1: Update `TABS` in `js/tab.js`.**
- Insert "Runes" tab (index 7), shift "Settings" to index 8.
- Add unlock condition: `player.pTimes > 0` (First Prestige).
- [ ] **Step 2: Add Rune Tab UI to `index.html`.**
- [ ] **Step 3: Update stat gain in `js/main.js`.**
- Multiplier/Exponent: `gain = (base + runes.add).mul(runes.mult).pow(runes.exp)`.
- [ ] **Step 4: Commit.**
```bash
git add js/tab.js js/main.js index.html
git commit -m "feat: integrate rune tab and stat effects"
```

---

### Task 4: Verification
- [ ] **Step 1: Verify cost scaling.** Buy level 1 PP pack, ensure cost is 1.5e20.
- [ ] **Step 2: Verify time-gate.** Ensure pack takes 30s to open at Speed 0.
- [ ] **Step 3: Verify gains.** Ensure runes correctly apply additive, multiplicative, and exponential boosts.
