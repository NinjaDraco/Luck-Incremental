const RUNES = {
    packs: {
        pp: { cost_base: E(1e20), res: "pp" },
        tp: { cost_base: E(1e15), res: "tp" },
        rp: { cost_base: E(1e10), res: "rp" },
        ma: { cost_base: E(1e15), res: "mastery_essence" },
        as: { cost_base: E(1e50), res: "ap" },
    },

    getCost(type) {
        let p = this.packs[type]
        let lvl = player.runes.packs[type].lvl
        return p.cost_base.mul(Decimal.pow(10, lvl.pow(1.25)))
    },

    openPack(type) {
        let cost = this.getCost(type)
        let res = this.packs[type].res
        if (player[res].gte(cost)) {
            player[res] = player[res].sub(cost)
            player.runes.packs[type].lvl = player.runes.packs[type].lvl.add(1)
            player.runes.packs[type].queue++
        }
    },

    setAutoPack(type) {
        player.runes.upgs.auto_pack = type
    },

    getEff(type, stat) {
        let val = player.runes.items[type + "_" + stat]
        if (stat === 'add') return val
        if (stat === 'mult') {
            let base = E(1).add(val)
            if (base.gt(1e10)) base = Decimal.pow(10, base.log10().softcap(10, 0.5, "pow"))
            if (base.gt(1e100)) base = Decimal.pow(10, base.log10().softcap(100, 0.1, "pow"))
            return base
        }
        if (stat === 'exp') {
            if (val.gt(1.1)) val = val.softcap(1.1, 0.5, "pow")
            if (val.gt(1.2)) val = val.softcap(1.2, 0.1, "pow")
            return val
        }
        return E(1)
    },

    update(diff) {
        if (!player.runes.unl) return

        let runeSpeed = player.runes.upgs.speed || E(0)
        let runeBulk = player.runes.upgs.bulk || E(0)

        // Auto Pack Logic
        let auto = player.runes.upgs.auto_pack || "none"
        if (auto !== "none") {
            let cost = this.getCost(auto)
            let res = this.packs[auto].res
            if (player[res].gte(cost)) this.openPack(auto)
        }

        // Opening Time: 30 / (1 + RuneSpeed) seconds.
        let time = E(30).div(E(1).add(runeSpeed))

        for (let type in this.packs) {
            let p = player.runes.packs[type]
            if (p.queue > 0) {
                let added = E(diff).div(time)
                p.progress = p.progress.add(added)
                
                if (p.progress.gte(1)) {
                    let completions = p.progress.floor()
                    if (completions.gt(p.queue)) completions = E(p.queue)
                    
                    let baseRolls = E(1).add(runeBulk.floor())
                    this.roll(type, baseRolls.mul(completions))
                    
                    p.queue -= completions.toNumber()
                    p.progress = p.progress.sub(completions)
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

            let cloneChance = runeClone.mul(0.1).toNumber()
            let count = (Math.random() < cloneChance) ? 2 : 1
            let effectiveCount = multiplier.mul(count)

            if (res === "easy") {
                let addAmt = type === 'ma' ? E(1e15) : E(100)
                player.runes.items[type + "_add"] = player.runes.items[type + "_add"].add(addAmt.mul(effectiveCount))
            } else if (res === "middle") {
                // Middle runes ADD to _mult
                player.runes.items[type + "_mult"] = player.runes.items[type + "_mult"].add(effectiveCount)
            } else if (res === "rare") {
                player.runes.items[type + "_exp"] = player.runes.items[type + "_exp"].add(E(0.001).mul(effectiveCount))
            }
        }
    }
}
