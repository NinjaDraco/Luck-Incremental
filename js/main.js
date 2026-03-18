var player = {}, date = Date.now(), diff = 0;

function loop() {
    diff = Date.now() - date
    updateTemp()
    updateHTML()
    calc(diff/1000);
    date = Date.now();
}

const MAIN = {
    prestige: {
        gain() {
            let r = player.max_rarity.sub(15)
            if (r.lt(0)) return E(0)
            let x = Decimal.pow(1.1,r).mul(r.add(1))

            x = x.mul(upgradeEffect('tp',1)).mul(upgradeEffect('rp',1)).mul(upgradeEffect('es',1)[1])

            return x.floor()
        },
        reset() {
            if (player.max_rarity.gte(15)) {
                player.pp = player.pp.add(tmp.ppGain)
                player.pTimes++

                this.doReset()
            }
        },
        doReset() {
            player.max_rarity = E(0)
            player.roll_time = 0
        },
    },
    trans: {
        gain() {
            let r = player.max_rarity.sub(100)
            if (r.lt(0)) return E(0)
            r = r.add(1).root(2)
            let x = Decimal.pow(1.1,r).mul(r.add(1)).mul(player.pp.div(1e8).max(1).root(2))
            
            x = x.mul(upgradeEffect('rp',2)).mul(upgradeEffect('es',3)[1])

            return x.floor()
        },
        reset() {
            if (player.max_rarity.gte(100)) {
                player.tp = player.tp.add(tmp.tpGain)
                player.tTimes++

                this.doReset()
            }
        },
        doReset() {
            player.pp = E(0)
            resetUpgrades('pp',hasUpgrade('es',2)?[1]:[])

            MAIN.prestige.doReset()
        },
    },
    rein: {
        gain() {
            let r = player.max_rarity.sub(300)
            if (r.lt(0)) return E(0)
            r = r.add(1).root(2)
            let x = Decimal.pow(1.1,r).mul(r.add(1)).mul(player.tp.div(1e9).max(1).root(3))

            x = x.mul(upgradeEffect('es',4)[1])

            return x.floor()
        },
        reset() {
            if (player.max_rarity.gte(300)) {
                player.rp = player.rp.add(tmp.rpGain)
                player.rTimes++

                this.doReset()
            }
        },
        doReset() {
            player.tp = E(0)
            resetUpgrades('tp')

            MAIN.trans.doReset()
        },
    },
    mastery: {
        req() {
            let x = 750 + 600 * player.mastery_tier

            return x
        },
        reset() {
            if (player.max_rarity.gte(tmp.mTierReq)) {
                player.mastery_tier++

                this.doReset()
            }
        },
        doReset() {
            player.rp = E(0)
            resetUpgrades('rp', hasUpgrade('es',2)?[3,4]:[])

            MAIN.rein.doReset()
        },
        effect() {
            let t = player.mastery_tier

            let x = Math.pow(t+1,1/3)

            let y = Decimal.pow(10,t-1).mul(t)

            return {luck: x, gen: y}
        },
        essGain() {
            let x = tmp.mTierEff.gen.mul(upgradeEffect('pp',4))

            return x
        },
    },
    ascension: {
        gain() {
            let r = player.max_rarity.sub(100000)
            if (r.lt(0)) return E(0)
            let x = player.max_rarity.div(100000).pow(0.5)
            return x.floor()
        },
        reset() {
            if (player.max_rarity.gte(100000)) {
                player.ascension_energy = player.ascension_energy.add(tmp.asGain)
                player.aTimes++

                this.doReset()
            }
        },
        doReset() {
            player.mastery_tier = 0
            player.mastery_essence = E(0)
            player.luck_essence = E(0)
            resetUpgrades('es')

            MAIN.mastery.doReset()
        },
    },
}

el.update.main = ()=>{
    if (tab == 0) {
        tmp.el.pres_btn.setClasses({locked: tmp.ppGain.lt(1), pres_btn: true})

        tmp.el.pres_btn.setHTML(`
        (Require ${getRarityName(15).bold()})<br>
        Prestige for ${tmp.ppGain.format(0).bold()} Prestige Points
        `)

        tmp.el.tran_btn.setDisplay(player.pTimes>0)
        tmp.el.tran_btn.setClasses({locked: tmp.tpGain.lt(1), pres_btn: true})

        tmp.el.tran_btn.setHTML(`
        (Require ${getRarityName(100).bold()})<br>
        Transcend for ${tmp.tpGain.format(0).bold()} Trancension Points
        `)

        tmp.el.rein_btn.setDisplay(player.tTimes>0)
        tmp.el.rein_btn.setClasses({locked: tmp.rpGain.lt(1), pres_btn: true})

        tmp.el.rein_btn.setHTML(`
        (Require ${getRarityName(300).bold()})<br>
        Reincarnate for ${tmp.rpGain.format(0).bold()} Reincarnation Points
        `)
    }
    else if (tab == 1) {
        tmp.el.mastery_btn.setClasses({locked: player.max_rarity.lt(tmp.mTierReq), pres_btn: true})

        tmp.el.mastery_btn.setHTML(`
        (Require ${getRarityName(tmp.mTierReq).bold()})<br>
        Evolve Master Tier to <b>${format(player.mastery_tier+1,0)}</b>
        `)

        tmp.el.mastery_tier.setDisplay(player.mastery_tier>0)

        if (player.mastery_tier>0) {
            tmp.el.mastery_tier.setHTML(
                `Your Mastery Tier is <h3>${format(player.mastery_tier,0)}</h3>, which boosts luck by ^<h3>${format(tmp.mTierEff.luck)}</h3> and generates <h3>${tmp.essGain.format()}</h3> Mastery Essence every second.`
            )
        }
    }

    // Luck Multiplier

    tmp.el.luck_mult.setHTML("Your luck multiplier: "+formatMult(tmp.luckMult))

    // Luck Essence display (tab 2)
    if (tab == 2 && tmp.el.luck_essence_display) {
        tmp.el.luck_essence_display.setHTML(`
            You have <b>${player.luck_essence.format()}</b> Luck Essence.<br>
            Gaining <b>${tmp.leGain.format()}/s</b> from rolls above 100&sigma;.
        `)
    }
    // Celestial display (tab 3)
    if (tab == 3 && tmp.el.celestial_display) {
        tmp.el.celestial_display.setHTML(
            player.mastery_tier < 100
            ? `<span style='color:var(--text-secondary)'>Unlock at Mastery Tier <b style='color:white'>100</b> (currently ${player.mastery_tier})</span>`
            : `Celestial layer is active!`
        )
    }

    if (tab == 4 && tmp.el.ascension_btn) {
        tmp.el.ascension_btn.setClasses({locked: player.max_rarity.lt(100000), pres_btn: true})

        tmp.el.ascension_btn.setHTML(`
        (Require ${getRarityName(100000).bold()})<br>
        Ascend for ${tmp.asGain.format(0).bold()} Ascension Energy
        `)
    }
}

tmp_update.push(()=>{
    tmp.ppGain = MAIN.prestige.gain()
    tmp.tpGain = MAIN.trans.gain()
    tmp.rpGain = MAIN.rein.gain()

    tmp.mTierReq = MAIN.mastery.req()
    tmp.mTierEff = MAIN.mastery.effect()

    tmp.essGain = MAIN.mastery.essGain()

    // Luck Essence gain per second (based on mastery tier > 0)
    tmp.leGain = player.mastery_tier > 0
        ? Decimal.pow(player.max_rarity.add(1).max(1).log10().add(1), 2).mul(player.mastery_tier)
        : E(0)

    tmp.asGain = MAIN.ascension.gain()
})