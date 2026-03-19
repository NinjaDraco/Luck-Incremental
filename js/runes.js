const RUNES = {
    packs: {
        pp: { cost_base: E(1e20), cost_scale: 1.5, res: "pp" },
        tp: { cost_base: E(1e15), cost_scale: 1.8, res: "tp" },
        rp: { cost_base: E(1e10), cost_scale: 2.0, res: "rp" },
        ma: { cost_base: E(1e15), cost_scale: 2.5, res: "mastery_essence" },
        as: { cost_base: E(1e50), cost_scale: 3.0, res: "ap" },
    },

    getCost(type) {
        let p = this.packs[type]
        let lvl = player.runes.packs[type].lvl
        return p.cost_base.mul(Decimal.pow(10, lvl.pow(1.25)))
    },

    buy(type) {
        let cost = this.getCost(type)
        let res = this.packs[type].res
        if (player[res].gte(cost)) {
            player[res] = player[res].sub(cost)
            player.runes.packs[type].lvl = player.runes.packs[type].lvl.add(1)
            player.runes.packs[type].queue++
        }
    },

    toggleOpening(type) {
        const types = ["none", "pp", "tp", "rp", "ma", "as"]
        let current = player.runes.upgs.auto_pack || "none"
        let index = types.indexOf(current)
        player.runes.upgs.auto_pack = types[(index + 1) % types.length]
    },

    update(diff) {
        if (!player.runes.unl) return

        let runeSpeed = player.runes.upgs.speed || E(0)
        let runeBulk = player.runes.upgs.bulk || E(0)

        // Auto Pack Logic
        let auto = player.runes.upgs.auto_pack || "none"
        if (auto !== "none") this.buy(auto)

        // Opening Time: 30 / (1 + RuneSpeed) seconds.
        let time = E(30).div(E(1).add(runeSpeed))

        for (let type in this.packs) {
            let p = player.runes.packs[type]
            if (p.queue > 0 && p.lvl.gt(0)) {
                let added = E(diff).div(time)
                p.progress = p.progress.add(added)
                
                if (p.progress.gte(1)) {
                    let completions = p.progress.floor().min(p.queue)
                    
                    // Rune Bulk: Adds floor(RuneBulk) to the number of rolls.
                    // Each completion gives (1 + floor(RuneBulk)) rolls.
                    let baseRolls = E(1).add(runeBulk.floor())
                    let totalRolls = baseRolls.mul(completions)

                    this.roll(type, totalRolls)
                    
                    p.progress = p.progress.sub(completions)
                    p.queue -= completions.toNumber()
                }
            } else {
                p.progress = E(0)
            }
        }
    },

    roll(type, totalCount = E(1)) {
        let runeLuck = player.runes.upgs.luck || E(0)
        let runeClone = player.runes.upgs.clone || E(0)

        // Rarity Weights (Base): Easy: 100, Middle: 10, Rare: 1
        // Rune Luck: Multiplies the weights of Middle and Rare runes.
        let wEasy = 100
        let wMiddle = E(10).mul(E(1).add(runeLuck)).toNumber()
        let wRare = E(1).mul(E(1).add(runeLuck)).toNumber()

        let totalWeight = wEasy + wMiddle + wRare
        
        let rollLimit = 100
        let numRolls = totalCount.min(rollLimit).toNumber()
        let multiplier = totalCount.div(numRolls)

        for (let i = 0; i < numRolls; i++) {
            let rand = Math.random() * totalWeight

            let res = "easy"
            if (rand < wRare) res = "rare"
            else if (rand < wRare + wMiddle) res = "middle"

            // Rune Clone: Provides a chance (e.g., RuneClone * 10%) to double the result of each roll.
            let cloneChance = runeClone.mul(0.1).toNumber()
            let count = (Math.random() < cloneChance) ? 2 : 1
            let effectiveCount = multiplier.mul(count)

            if (res === "easy") {
                // Easy: +100 to _add (1e15 for ma)
                let addAmt = type === 'ma' ? E(1e15) : E(100)
                player.runes.items[type + "_add"] = player.runes.items[type + "_add"].add(addAmt.mul(effectiveCount))
            } else if (res === "middle") {
                // Middle: *2 to _mult
                player.runes.items[type + "_mult"] = player.runes.items[type + "_mult"].mul(Decimal.pow(2, effectiveCount))
            } else if (res === "rare") {
                // Rare: +0.001 to _exp (additive boost to prevent infinite loops)
                player.runes.items[type + "_exp"] = player.runes.items[type + "_exp"].add(E(0.001).mul(effectiveCount))
            }
        }
    }
}
