const RUNES = {
    packs: {
        pp: { cost_base: E(1e20), res: "pp", add: 100, res_name: "PP" },
        tp: { cost_base: E(1e15), res: "tp", add: 100, res_name: "TP" },
        rp: { cost_base: E(1e10), res: "rp", add: 100, res_name: "RP" },
        ma: { cost_base: E(1e15), res: "mastery_essence", add: 1e15, res_name: "ME" },
        as: { cost_base: E(1e50), res: "ap", add: 100, res_name: "AP" },
        rb: { cost_base: E(1e10), res: "reb", add: 100, res_name: "RB" },
        ms: { cost_base: E(1e100), res: "mastery_stone", add: 1e50, res_name: "MASTERY STONE" },
        mc: { cost_base: E(1e15), res: "mastery_clover", add: 1e5, res_name: "MASTERY CLOVER" },
        se: { cost_base: E(1e50), res: "super_essence", add: 1e20, res_name: "SUPER ESSENCE" },
        he: { cost_base: E(1e20), res: "hyper_essence", add: 1e10, res_name: "HYPER ESSENCE" },
    },

    getCost(type) {
        let p = this.packs[type]
        let lvl = player.runes.packs[type].lvl
        let damp = upgradeEffect('le',7,E(1))
        
        let mult = 2
        if (type == 'pp') mult = 1.5
        if (type == 'tp') mult = 1.8
        if (type == 'rp') mult = 2.0
        
        // Optimization: use simpler power if damp is 1
        if (damp.eq(1)) return p.cost_base.mul(Decimal.pow(mult, lvl))
        return p.cost_base.mul(Decimal.pow(mult, lvl.pow(damp)))
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

    toggleAutoPack(type) {
        let i = player.runes.upgs.auto_pack.indexOf(type)
        if (i > -1) player.runes.upgs.auto_pack.splice(i, 1)
        else {
            let max = upgradeEffect('le',2,0) + 1
            if (player.runes.upgs.auto_pack.length < max) player.runes.upgs.auto_pack.push(type)
        }
    },

    getEff(type, stat) {
        let val = player.runes.items[type + "_" + stat]
        let potency = upgradeEffect('le',6,E(1))
        if (stat === 'add') return val.mul(potency)
        if (stat === 'mult') {
            let base = E(1).add(val.mul(potency))
            if (base.gt(1e10)) base = Decimal.pow(10, base.log10().softcap(10, 0.5, "pow"))
            if (base.gt(1e100)) base = Decimal.pow(10, base.log10().softcap(100, 0.1, "pow"))
            return base
        }
        if (stat === 'exp') {
            let v = val.sub(1).mul(potency).add(1)
            if (v.gt(1.1)) v = v.softcap(1.1, 0.5, "pow")
            if (v.gt(1.2)) v = v.softcap(1.2, 0.1, "pow")
            return v
        }
        return E(1)
    },

    update(diff) {
        if (!player.runes.unl) return

        let runeSpeed = player.runes.upgs.speed || E(0)
        let runeBulk = player.runes.upgs.bulk || E(0)
        let bulkAdd = upgradeEffect('le',4,E(0))
        let quantum = upgradeEffect('le',3,E(1))

        // Auto Pack Logic
        for (let target of player.runes.upgs.auto_pack) {
            let cost = this.getCost(target)
            let res = this.packs[target].res
            if (player[res].gte(cost)) this.openPack(target)
        }

        // Opening Time: 30 / (1 + RuneSpeed) milliseconds. (Was seconds, making it 1000x slower)
        let time = E(30).div(E(1).add(runeSpeed)).mul(quantum).max(0.1)

        for (let type in this.packs) {
            let p = player.runes.packs[type]
            if (p.queue > 0) {
                let added = E(diff).mul(1000).div(time)
                p.progress = p.progress.add(added)
                
                if (p.progress.gte(1)) {
                    let batch = upgradeEffect('le',8,E(1))
                    let completions = p.progress.floor().min(p.queue).min(batch)
                    
                    if (completions.gt(0)) {
                        let baseRolls = E(1).add(runeBulk.floor()).add(bulkAdd)
                        this.roll(type, baseRolls.mul(completions))
                        
                        p.queue = Math.max(0, p.queue - completions.toNumber())
                        p.progress = p.progress.sub(completions)
                    }
                }
            }
        }
    },

    roll(type, totalCount = E(1)) {
        totalCount = E(totalCount)
        if (totalCount.lte(0) || isNaN(totalCount.mag)) return;

        let runeLuck = (player.runes.upgs.luck || E(0)).mul(upgradeEffect('le',5,E(1)))
        let runeClone = player.runes.upgs.clone || E(0)

        // Rarity Weights (Base): Easy: 100, Middle: 10, Rare: 1
        let wEasy = 100
        let wMiddle = E(10).mul(E(1).add(runeLuck))
        if (hasUpgrade('ce', 9)) wMiddle = wMiddle.mul(upgradeEffect('ce', 9))
        wMiddle = wMiddle.toNumber()

        let wRare = E(1).mul(E(1).add(runeLuck))
        if (hasUpgrade('ce', 9)) wRare = wRare.mul(upgradeEffect('ce', 9))
        wRare = wRare.toNumber()

        let totalWeight = wEasy + wMiddle + wRare
        
        let rollLimit = 100
        let numRolls = totalCount.min(rollLimit).toNumber()
        let multiplier = totalCount.div(numRolls)

        for (let i = 0; i < numRolls; i++) {
            let rand = secureRandom() * totalWeight

            let res = "easy"
            if (rand < wRare) res = "rare"
            else if (rand < wRare + wMiddle) res = "middle"

            let cloneChance = runeClone.mul(0.1).toNumber()
            let count = (secureRandom() < cloneChance) ? 2 : 1
            let effectiveCount = multiplier.mul(count)

            if (res === "easy") {
                let addAmt = E(this.packs[type].add || 100)
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
