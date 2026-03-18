const RUNES = {
    packs: {
        pp: { cost_base: E(1e20), cost_scale: 1.5, res: "pp" },
        tp: { cost_base: E(1e15), cost_scale: 1.8, res: "tp" },
        rp: { cost_base: E(1e10), cost_scale: 2.0, res: "rp" },
    },

    getCost(type) {
        let p = this.packs[type]
        let lvl = player.runes.packs[type].lvl
        return p.cost_base.mul(Decimal.pow(p.cost_scale, lvl))
    },

    buy(type) {
        let cost = this.getCost(type)
        let res = this.packs[type].res
        if (player[res].gte(cost)) {
            player[res] = player[res].sub(cost)
            player.runes.packs[type].lvl = player.runes.packs[type].lvl.add(1)
        }
    },

    toggleOpening(type) {
        player.runes.packs[type].opening = !player.runes.packs[type].opening
    },

    update(diff) {
        if (!player.runes.unl) return

        let runeSpeed = player.runes.upgs.speed || E(0)
        let runeBulk = player.runes.upgs.bulk || E(0)

        // Opening Time: 30 / (1 + RuneSpeed) seconds.
        let time = E(30).div(E(1).add(runeSpeed))

        for (let type in this.packs) {
            let p = player.runes.packs[type]
            if (p.opening && p.lvl.gt(0)) {
                let added = E(diff).div(time)
                p.progress = p.progress.add(added)
                
                if (p.progress.gte(1)) {
                    let completions = p.progress.floor()
                    
                    // Rune Bulk: Adds floor(RuneBulk) to the number of rolls.
                    // Each completion gives (1 + floor(RuneBulk)) rolls.
                    let baseRolls = E(1).add(runeBulk.floor())
                    let totalRolls = baseRolls.mul(completions)

                    for (let i = 0; i < totalRolls.toNumber(); i++) {
                        this.roll(type)
                    }
                    
                    p.progress = p.progress.sub(completions)
                }
            } else {
                p.progress = E(0)
            }
        }
    },

    roll(type) {
        let runeLuck = player.runes.upgs.luck || E(0)
        let runeClone = player.runes.upgs.clone || E(0)

        // Rarity Weights (Base): Easy: 100, Middle: 10, Rare: 1
        // Rune Luck: Multiplies the weights of Middle and Rare runes.
        let wEasy = 100
        let wMiddle = E(10).mul(E(1).add(runeLuck)).toNumber()
        let wRare = E(1).mul(E(1).add(runeLuck)).toNumber()

        let totalWeight = wEasy + wMiddle + wRare
        let rand = Math.random() * totalWeight

        let res = "easy"
        if (rand < wRare) res = "rare"
        else if (rand < wRare + wMiddle) res = "middle"

        // Rune Clone: Provides a chance (e.g., RuneClone * 10%) to double the result of each roll.
        let cloneChance = runeClone.mul(0.1).toNumber()
        let count = (Math.random() < cloneChance) ? 2 : 1

        for (let i = 0; i < count; i++) {
            if (res === "easy") {
                // Easy: +100 to _add
                player.runes.items[type + "_add"] = player.runes.items[type + "_add"].add(100)
            } else if (res === "middle") {
                // Middle: *2 to _mult
                player.runes.items[type + "_mult"] = player.runes.items[type + "_mult"].mul(2)
            } else if (res === "rare") {
                // Rare: ^1.001 to _exp (applied as _exp = _exp.mul(1.001))
                player.runes.items[type + "_exp"] = player.runes.items[type + "_exp"].mul(1.001)
            }
        }
    }
}
