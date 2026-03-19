# Rune System Design Document

The Rune system is a new permanent unlockable feature in Luck Incremental. It introduces Rune Packs (Pokemon-style card packs) that provide runes with additive, multiplicative, or exponential boosts to existing stats.

## Core Mechanics

### 1. Rune Packs
- Rune packs are purchased using different currencies (Prestige Points, Trans Points, Reincarnation Points).
- Each pack contains a set of runes.
- Rune packs have different rarity tiers (Easy, Middle, Rare/Hard).
- Rune packs will have a logo/visual representation in the UI.

### 2. Rune Effects
- **Easy Runes**: Provide additive boosts (e.g., +100 Prestige Points gain).
- **Middle Runes**: Provide multiplicative boosts (e.g., *2 Prestige Points gain).
- **Rare/Hard Runes**: Provide exponential boosts (e.g., ^1.001 to Prestige Points gain).

### 3. Rune Upgrades
The Rune system includes its own set of upgrades to improve rune generation and effectiveness:
- **Rune Speed**: Decreases the time taken to open or process runes.
- **Rune Bulk**: Increases the number of runes obtained per pack or action.
- **Rune Clone**: Provides a chance to duplicate a rune upon acquisition.
- **Rune Luck**: Slightly improves the chance of obtaining rarer runes.

### 4. Cost & Time Scaling
To ensure game balance, Rune packs will use absolute scaling costs and a time-gate for opening.
- **Prestige Rune Pack**: Base Cost `1e20 PP`, Scaling `x1.5` per level.
- **Trans Rune Pack**: Base Cost `1e15 TP`, Scaling `x1.8` per level.
- **Rein Rune Pack**: Base Cost `1e10 RP`, Scaling `x2.0` per level.
- **Time-Gate**: Each pack takes `30 / (1 + RuneSpeed)` seconds to open.
- **Bulk**: `RuneBulk` increases the amount of runes found per pack (e.g., `1 + floor(RuneBulk)`).

## UI Design

### 1. Rune Tab
- A new tab labeled "Rune" will be added to the sidebar.
- The tab will display:
    - Current Rune count and types.
    - Available Rune Packs with logos.
    - Rune Upgrades.
- Each Rune Pack will have a unique logo and visual style.

### 2. Integration
- The Rune tab will be integrated into the existing tab system in `js/tab.js`.
- It will unlock after a specific milestone (e.g., first Prestige or Transcend).

## Data Structure

```javascript
player.runes = {
    amount: E(0),
    packs: {
        prestige: E(0),
        trans: E(0),
        rein: E(0),
    },
    upgrades: {
        speed: E(0),
        bulk: E(0),
        clone: E(0),
        luck: E(0),
    },
    items: [], // Store actual runes and their effects
}
```

## Technical Implementation

### 1. Files to Modify
- `index.html`: Add the Rune tab container.
- `js/main.js`: Update HTML for the Rune tab and integrate rune effects into stat calculations.
- `js/saves.js`: Add rune data to the player object and handle saving/loading.
- `js/tab.js`: Add the Rune tab to the navigation menu.
- `js/upgs.js`: (Optional) Add rune upgrades here or in a separate file.

### 2. New Files
- `js/runes.js`: Handle rune generation, cost scaling, and effect logic.

## Verification Plan

### 1. Cost Scaling Verification
- Test cost calculation at various stat levels (1e10, 1e100, 1e1000).
- Ensure cost never exceeds current stats.

### 2. Rune Effect Verification
- Verify additive boosts correctly update stat gains.
- Verify multiplicative boosts correctly update stat gains.
- Verify exponential boosts correctly update stat gains.

### 3. Upgrade Verification
- Confirm Rune Speed correctly reduces intervals.
- Confirm Rune Bulk increases rune yield.
- Confirm Rune Clone works as expected.
- Confirm Rune Luck improves rarity distribution.
