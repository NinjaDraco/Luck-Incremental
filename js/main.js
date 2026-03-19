var player = {}, date = Date.now(), diff = 0;

function loop() {
    diff = Date.now() - date
    calc(diff/1000);
    date = Date.now();
}

function uiLoop() {
    updateTemp()
    updateHTML()
}

const MAIN = {
    prestige: {
        gain() {
            let r = player.max_rarity.sub(15)
            if (r.lt(0) || (player.currentChall >= 2 && player.currentChall <= 10)) return E(0)
            let x = Decimal.pow(1.1,r).mul(r.add(1)).pow(player.chall[2].add(1).log10().div(90).add(1).mul(player.chall[3].add(1).log10().div(90).add(1)).mul(player.chall[4].add(1).log10().div(90).add(1)))

            x = x.mul(upgradeEffect('tp',1)).mul(upgradeEffect('rp',1)).mul(upgradeEffect('ap',1)).mul(upgradeEffect('es',1)[1])
            
            x = x.mul(tmp.weatherEff.all)

            x = x.add(RUNES.getEff('pp','add')).mul(RUNES.getEff('pp','mult')).pow(RUNES.getEff('pp','exp'))

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
            let r = player.max_rarity.sub(100-upgradeEffect('st',8,0))
            if (r.lt(0) || (player.currentChall >= 5 && player.currentChall <= 10)) return E(0)
            r = r.add(1).root(hasUpgrade('st',8)?1.5:2).mul(player.upgrade.st[8].mul(3).add(1))
			
            let x = Decimal.pow(1.1,r).mul(r.add(1)).mul(player.pp.div(1e8).max(1).root(2)).pow(player.chall[5].add(1).log10().div(90).add(1).mul(player.chall[6].add(1).log10().div(90).add(1)).mul(player.chall[7].add(1).log10().div(90).add(1)))
            
			if(player.pp.gte("1e5000"))x = Decimal.pow(1.1,r).mul(r.add(1)).mul(Decimal.pow(10,player.pp.log10().scale(5000,1.0002,1,true).sub(8).div(2))).pow(player.chall[5].add(1).log10().div(90).add(1).mul(player.chall[6].add(1).log10().div(90).add(1)).mul(player.chall[7].add(1).log10().div(90).add(1)));
			
            x = x.mul(upgradeEffect('rp',2)).mul(upgradeEffect('ap',2)).mul(upgradeEffect('es',3)[1])

            x = x.mul(tmp.weatherEff.all)

            x = x.add(RUNES.getEff('tp','add')).mul(RUNES.getEff('tp','mult')).pow(RUNES.getEff('tp','exp'))

            return x.floor()
        },
        reset() {
            if (player.max_rarity.gte(100-upgradeEffect('st',8,0))) {
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
            let r = player.max_rarity.sub(300-upgradeEffect('se',10,0))
            if (r.lt(0) || (player.currentChall >= 8 && player.currentChall <= 10)) return E(0)
            r = r.add(1).root(hasUpgrade('se',10)?1.7:2).mul(player.upgrade.se[10].mul(4).add(1))
            let x = Decimal.pow(1.1,r).mul(r.add(1)).mul(player.tp.div(1e9).max(1).root(3)).pow(player.chall[8].add(1).log10().div(90).add(1)).pow(player.chall[9].add(1).log10().div(90).add(1))

			if(player.tp.gte("1e5000"))x = Decimal.pow(1.1,r).mul(r.add(1)).mul(Decimal.pow(10,player.tp.log10().scale(5000,1.0002,1,true).sub(9).div(3))).pow(player.chall[8].add(1).log10().div(90).add(1)).pow(player.chall[9].add(1).log10().div(90).add(1));
				
            x = x.mul(upgradeEffect('ap',3)).mul(upgradeEffect('es',4)[1])

            x = x.mul(tmp.weatherEff.all)

            x = x.add(RUNES.getEff('rp','add')).mul(RUNES.getEff('rp','mult')).pow(RUNES.getEff('rp','exp'))

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
            resetUpgrades('tp', hasUpgrade('es',2)?[6]:[])

            MAIN.trans.doReset()
        },
    },
    asce: {
        gain() {
            let r = player.max_rarity.sub(24000-upgradeEffect('st',3,0))
            if (r.lt(0) || player.currentChall == 10) return E(0)
			if(hasUpgrade('st',3)) r = r.pow(player.upgrade.st[3].min(11).sub(1).pow(2).div(100).add(2).add(hasUpgrade('se',12)?player.upgrade.st[3].div(500):0)).mul(player.upgrade.st[3].pow(hasUpgrade('se',12)?5:2)).div(Decimal.pow(0.9,player.upgrade.st[3]).mul(100000).add(1))
			else r = r.div(40)
            let x = r.add(1).mul(player.rp.add(1).log10().div(600).pow(2).max(1))
			
			x = x.mul(upgradeEffect('pp',7)).mul(upgradeEffect('ap',4)).mul(upgradeEffect('es',13)).mul(upgradeEffect('st',12)).mul(hasUpgrade('se',9)?player.chall[10].add(1).pow(player.upgrade.se[9].log10().add(1)):player.chall[10].add(1).log10().add(1))

            x = x.mul(tmp.weatherEff.all)

            x = x.add(RUNES.getEff('as','add')).mul(RUNES.getEff('as','mult')).pow(RUNES.getEff('as','exp'))

            return x.floor()
        },
        reset() {
            if (player.max_rarity.gte(24000-upgradeEffect('st',3,0))) {
                player.ap = player.ap.add(tmp.apGain)
                player.aTimes++

                this.doReset()
            }
        },
        doReset() {
            player.rp = E(0)
            resetUpgrades('rp', hasUpgrade('es',2)?[3,4]:[])

            MAIN.rein.doReset()
        },
    },
    reb: {
        gain() {
			if(!hasUpgrade('he',8)) return E(0);
            let x = player.max_rarity.add(10).log10().mul(player.ap.add(10).log10()).pow(E(20).add(upgradeEffect('reb',2))).div(Decimal.pow(10,Decimal.pow(10,E(2).sub(player.upgrade.reb[2].div(700))))).mul(upgradeEffect('reb',4));
            
            x = x.mul(tmp.weatherEff.all)

            x = x.add(RUNES.getEff('rb','add')).mul(RUNES.getEff('rb','mult')).pow(RUNES.getEff('rb','exp'))

            return x.floor()
        },
        reset() {
            if (hasUpgrade('he',8)) {
                player.reb = player.reb.add(tmp.rebGain)
                this.doReset()
            }
        },
        doReset() {
            player.ap = E(0)
            resetUpgrades('ap', [])

            MAIN.asce.doReset()
        },
    },
    mastery: {
        req() {
			if(player.super_tier>=1) return player.mastery_tier**3;
			if(player.mastery_tier==0) return 777;
				
            let x = 500 + 600 * player.mastery_tier;

			if(player.mastery_tier>=10) x = 600 * player.mastery_tier + 5 * (player.mastery_tier**2);
			if(player.mastery_tier>=20) x = 35 * (player.mastery_tier**2);
			if(player.mastery_tier>=35) x = player.mastery_tier**3;
			
            return x
        },
        reset() {
            if (player.max_rarity.gte(tmp.mTierReq)) {
                player.mastery_tier++
                this.doReset()
            }
        },
        doReset() {
            player.reb = E(0)
            resetUpgrades('reb', [])
            MAIN.reb.doReset()
        },
        effect() {
            let t = player.mastery_tier

            let x = Math.pow(t*upgradeEffect('st',6,E(1)).toNumber()*(upgradeEffect('se',7,E(1)).toNumber())*(upgradeEffect('he',5,E(1)).toNumber())+1,1/3)
            x *= upgradeEffect('le',0,E(1)).toNumber()

            let y = Decimal.pow(upgradeEffect('st',13).add(10),t-1).mul(t)

			if(player.currentChall == 11) x=1, y=E(0);
            return {luck: x, gen: y}
        },
        essGain() {
			if(player.currentChall == 11) return E(0);
            let x = tmp.mTierEff.gen.mul(upgradeEffect('pp',4)).mul(upgradeEffect('tp',7)).mul(upgradeEffect('es',7)).mul(upgradeEffect('ap',5)).mul(upgradeEffect('st',2)).mul(upgradeEffect('se',0))

            x = x.mul(tmp.weatherEff.all)

            x = x.add(RUNES.getEff('ma','add')).mul(RUNES.getEff('ma','mult')).pow(RUNES.getEff('ma','exp'))

            return x
        },
        stoneGain() {
			if(player.currentChall == 11) return E(0);
			if(player.mastery_tier<45 && !hasUpgrade('se',4)) return E(0);
            let x = E(player.mastery_tier).div(hasUpgrade('se',4)?E(40).div(player.upgrade.se[4].root(2)):45).add(player.upgrade.se[4]).pow(upgradeEffect('he',3).add(25)).mul(upgradeEffect('st',2)).mul(upgradeEffect('se',0)).mul(upgradeEffect('he',0));

            x = x.mul(tmp.weatherEff.all)

            x = x.add(RUNES.getEff('ms','add')).mul(RUNES.getEff('ms','mult')).pow(RUNES.getEff('ms','exp'))

            return x
        },
        cloverGain() {
			if(!hasUpgrade('he',9)) return E(0);
			if(player.currentChall == 11) return E(0);
            let x = E(player.mastery_tier).div(1e12).pow(5).mul(upgradeEffect('cl',4));

            x = x.mul(tmp.weatherEff.all)

            x = x.add(RUNES.getEff('mc','add')).mul(RUNES.getEff('mc','mult')).pow(RUNES.getEff('mc','exp'))

            return x
        },
    },
    superT: {
        req() {
			if(player.super_tier>=8) return player.super_tier**3;
			return 100+50*player.super_tier;
        },
        reset() {
            if (player.mastery_tier >= tmp.sTierReq) {
                player.super_tier++
                this.doReset()
            }
        },
        doReset() {
            player.mastery_tier = 0
            player.mastery_essence = E(0)
            player.mastery_stone = E(0)
            player.mastery_clover = E(0)
            resetUpgrades('es', hasUpgrade('he',1)?[2]:[])
            resetUpgrades('st', hasUpgrade('he',1)?[4]:[])
            resetUpgrades('cl', hasUpgrade('he',1)?[0]:[])
            MAIN.mastery.doReset()
        },
        seGain() {
			if(player.super_tier==0) return E(0);
            let x = E(player.mastery_tier).mul(player.super_tier).pow(Math.log10((player.super_tier+1)**3+2)+2).mul(upgradeEffect('st',11)).mul(upgradeEffect('se',14)).mul(upgradeEffect('he',0));
            
            x = x.mul(tmp.weatherEff.all)

            x = x.add(RUNES.getEff('se','add')).mul(RUNES.getEff('se','mult')).pow(RUNES.getEff('se','exp'))

            return x
        },
    },
    hyperT: {
        req() {
			if(player.hyper_tier>=8) return player.hyper_tier**3;
			return 100+50*player.hyper_tier;
        },
        reset() {
            if (player.super_tier >= tmp.hTierReq) {
                player.hyper_tier++
                this.doReset()
            }
        },
        doReset() {
            player.super_tier = 0
            player.super_essence = E(0)
            resetUpgrades('se', [])
            MAIN.superT.doReset()
        },
        heGain() {
			if(player.hyper_tier==0) return E(0);
            let x = E(player.hyper_tier).pow(2).mul(E(player.super_tier).add(1)).pow(Math.log10((player.hyper_tier+1)**3+2));
            
            x = x.mul(tmp.weatherEff.all)

            x = x.add(RUNES.getEff('he','add')).mul(RUNES.getEff('he','mult')).pow(RUNES.getEff('he','exp'))

            return x
        },
    },
}

const RUNE_UPGS = {
    speed: {
        desc: "Increases rune opening speed.",
        cost: i => Decimal.pow(2, i).mul(10),
    },
    bulk: {
        desc: "Increases runes gained per opening cycle.",
        cost: i => Decimal.pow(5, i).mul(100),
    },
    luck: {
        desc: "Increases chance for better runes.",
        cost: i => Decimal.pow(3, i).mul(50),
    },
    clone: {
        desc: "Provides a chance to double rune results.",
        cost: i => Decimal.pow(10, i).mul(500),
    },
}

RUNES.buyUpg = function(id) {
    let lvl = player.runes.upgs[id]
    let cost = RUNE_UPGS[id].cost(lvl)
    if (player.luck_essence.gte(cost)) {
        player.luck_essence = player.luck_essence.sub(cost)
        player.runes.upgs[id] = player.runes.upgs[id].add(1)
    }
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
        (Require ${getRarityName(100-upgradeEffect('st',8,0)).bold()})<br>
        Transcend for ${tmp.tpGain.format(0).bold()} Trancension Points
        `)

        tmp.el.rein_btn.setDisplay(player.tTimes>0)
        tmp.el.rein_btn.setClasses({locked: tmp.rpGain.lt(1), pres_btn: true})
        tmp.el.rein_btn.setHTML(`
        (Require ${getRarityName(300-upgradeEffect('se',10,0)).bold()})<br>
        Reincarnate for ${tmp.rpGain.format(0).bold()} Reincarnation Points
        `)

        tmp.el.asce_btn.setDisplay(player.rTimes>0)
        tmp.el.asce_btn.setClasses({locked: tmp.apGain.lt(1), pres_btn: true})
        tmp.el.asce_btn.setHTML(`
        (Require ${getRarityName(24000-upgradeEffect('st',3,0)).bold()})<br>
        Ascend for ${tmp.apGain.format(0).bold()} Ascension Points
        `)

        tmp.el.reb_btn.setDisplay(hasUpgrade('he',8))
        tmp.el.reb_btn.setClasses({locked: tmp.rebGain.lt(1), pres_btn: true})
        tmp.el.reb_btn.setHTML(`
        Rebirth for ${tmp.rebGain.format(0).bold()} Rebirth Points
        `)
    }
    else if (tab == 1) {
        tmp.el.mastery_btn.setClasses({locked: player.max_rarity.lt(tmp.mTierReq), pres_btn: true})
        tmp.el.mastery_btn.setHTML(`
        (Require ${getRarityName(tmp.mTierReq).bold()})<br>
        Evolve Master Tier to <b>${format(player.mastery_tier+1,0)}</b>
        `)

        tmp.el.mastery_tier.setDisplay(player.mastery_tier>0)
        tmp.el.mastery_stone.setDisplay(player.mastery_tier>0)
        tmp.el.mastery_clover.setDisplay(hasUpgrade('he',9))

        if (player.mastery_tier>0) {
            tmp.el.mastery_tier.setHTML(
                `Your Mastery Tier is <h3>${format(player.mastery_tier,0)}</h3>, which boosts luck by ^<h3>${format(tmp.mTierEff.luck)}</h3> and generates <h3>${tmp.essGain.format()}</h3> Mastery Essence every second.`
            )
        }

        if (hasUpgrade('se',4) || player.mastery_tier >= 45) {
            tmp.el.mastery_stone.setHTML(
                `Your Mastery Tier is delaying post-100σ rarity scaling by <h3>${mTierSS().format()}</h3>, and generating <h3>${tmp.stoneGain.format()}</h3> Mastery Stones every second.`
            )
        } else {
            tmp.el.mastery_stone.setHTML(`Reach Mastery Tier 45 to gain Mastery Stones.`)
        }

        if (hasUpgrade('he',9)) {
            tmp.el.mastery_clover.setHTML(
                `Your Mastery Tier is generating <h3>${tmp.cloverGain.format()}</h3> Mastery Clovers every second.`
            )
        }
    }
    else if (tab == 3) {
        tmp.el.super_btn.setClasses({locked: player.mastery_tier < tmp.sTierReq, pres_btn: true})
        tmp.el.super_btn.setHTML(`
        (Require Mastery Tier ${format(tmp.sTierReq,0)})<br>
        Evolve Super Tier to <b>${format(player.super_tier+1,0)}</b>
        `)

        tmp.el.super_tier.setDisplay(player.super_tier>0)
        if (player.super_tier>0) {
            tmp.el.super_tier.setHTML(
                `Your Super Tier is <h3>${format(player.super_tier,0)}</h3>, which generates <h3>${tmp.seGain.format()}</h3> Super Essence every second.`
            )
        }
    }
    else if (tab == 4) {
        tmp.el.hyper_btn.setClasses({locked: player.super_tier < tmp.hTierReq, pres_btn: true})
        tmp.el.hyper_btn.setHTML(`
        (Require Super Tier ${format(tmp.hTierReq,0)})<br>
        Evolve Hyper Tier to <b>${format(player.hyper_tier+1,0)}</b>
        `)

        tmp.el.hyper_tier.setDisplay(player.hyper_tier>0)
        if (player.hyper_tier>0) {
            tmp.el.hyper_tier.setHTML(
                `Your Hyper Tier is <h3>${format(player.hyper_tier,0)}</h3>, which generates <h3>${tmp.heGain.format()}</h3> Hyper Essence every second.`
            )
        }
    }
    else if (tab == 7) {
        // Stats Summary - Cache check
        let totalItems = Object.values(player.runes.items).reduce((a, b) => a.add(b), E(0)).toString()
        if (tmp.last_rune_total !== totalItems) {
            tmp.last_rune_total = totalItems
            let h = ""
            const types = ["pp", "tp", "rp", "ma", "as", "rb", "ms", "mc", "se", "he"]
            const labels = ["Prestige", "Transcension", "Reincarnation", "Mastery", "Ascension", "Rebirth", "Stones", "Clovers", "Super Essence", "Hyper Essence"]
            for (let i = 0; i < types.length; i++) {
                let t = types[i]
                let label_class = t == 'ma' ? 'me' : (t == 'as' ? 'as' : (t == 'rb' ? 'rb' : t))
                h += `<div class="settings-card" style="padding: 10px; font-size: 13px; border: 1px solid #444; border-radius: 8px;">
                    <b class="${label_class}-label" style="font-size: 15px;">${labels[i]}</b><br>
                    <div style="margin-top: 5px;">
                        <span style="color: #00ff8c;">+${RUNES.getEff(t,'add').format()}</span><br>
                        <span style="color: #008cff;">x${RUNES.getEff(t,'mult').format()}</span><br>
                        <span style="color: #8c00ff;">^${RUNES.getEff(t,'exp').format(3)}</span>
                    </div>
                </div>`
            }
            tmp.el.rune_stats_summary.setHTML(h)
        }

        // Packs
        const types = ["pp", "tp", "rp", "ma", "as", "rb", "ms", "mc", "se", "he"]
        let damp = upgradeEffect('le', 7, E(1))
        for (let t of types) {
            let p = player.runes.packs[t]
            let infoEl = tmp.el[`rune_pack_${t}_info`]

            if (infoEl.lastQueue !== p.queue || infoEl.lastLvl === undefined || !infoEl.lastLvl.eq(p.lvl) || !infoEl.lastDamp.eq(damp)) {
                let cost = RUNES.getCost(t)
                let res = RUNES.packs[t].res_name

                infoEl.setHTML(`<b>Cost:</b> ${cost.format()} ${res}<br><b>Queue:</b> ${p.queue}`)

                infoEl.lastQueue = p.queue
                infoEl.lastLvl = p.lvl
                infoEl.lastDamp = damp
            }
            
            let prog = (p.progress.min(1).toNumber() * 100) + "%"
            let progEl = tmp.el[`rune_pack_${t}_progress`]
            if (progEl.lastWidth !== prog) {
                progEl.el.style.width = prog
                progEl.lastWidth = prog
            }
        }

        // Essence
        tmp.el.rune_essence_display.setHTML(`You have <b class="le-label">${player.luck_essence.format()}</b> Luck Essence`)

        // Upgrades
        if (tmp.last_le_val !== player.luck_essence.toString()) {
            tmp.last_le_val = player.luck_essence.toString()
            let h = ""
            for (let id in RUNE_UPGS) {
                let u = RUNE_UPGS[id]
                let lvl = player.runes.upgs[id]
                let cost = u.cost(lvl)
                h += `<button class="upg-btn ${player.luck_essence.lt(cost) ? 'locked' : ''}" onclick="RUNES.buyUpg('${id}')">
                    <b>${id.toUpperCase()}</b> [Level ${lvl.format(0)}]<br>
                    ${u.desc}<br>
                    Cost: ${cost.format()} Luck Essence
                </button>`
            }
            tmp.el.rune_upgrades_table.setHTML(h)
        }
    }

    // Luck Multiplier
    tmp.el.luck_mult.setHTML("Your luck multiplier: "+formatMult(tmp.luckMult))

    // Luck Essence display (tab 5)
    if (tab == 5 && tmp.el.luck_essence_display) {
        if (player.mastery_tier >= 5) {
            tmp.el.luck_essence_display.setHTML(`
                You have <b>${player.luck_essence.format()}</b> Luck Essence.<br>
                Gaining <b>${tmp.leGain.format()}/s</b> from rolls above 100&sigma;.
            `)
        } else {
            tmp.el.luck_essence_display.setHTML(`Reach <b>Mastery Tier 5</b> to unlock Luck Essence.`)
        }

        let max_slots = upgradeEffect('le',2,0) + 1
        tmp.el.auto_slots_used.setHTML(player.runes.upgs.auto_pack.length)
        tmp.el.auto_slots_total.setHTML(max_slots)

        const types_auto = ["pp", "tp", "rp", "ma", "as", "rb", "ms", "mc", "se", "he"]
        for (let i = 0; i < types_auto.length; i++) {
            let t = types_auto[i]
            let active = player.runes.upgs.auto_pack.includes(t)
            let el_btn = tmp.el[`auto_pack_check_${t}`]
            if (el_btn && el_btn.el && el_btn.el.checked !== active) el_btn.el.checked = active
        }
    }
}

tmp_update.push(()=>{
    if (player.pTimes > 0) player.runes.unl = true
    tmp.ppGain = MAIN.prestige.gain()
    tmp.tpGain = MAIN.trans.gain()
    tmp.rpGain = MAIN.rein.gain()
    tmp.apGain = MAIN.asce.gain()
    tmp.rebGain = MAIN.reb.gain()

    tmp.mTierReq = MAIN.mastery.req()
    tmp.mTierEff = MAIN.mastery.effect()

    tmp.essGain = MAIN.mastery.essGain()
    tmp.stoneGain = MAIN.mastery.stoneGain()
    tmp.cloverGain = MAIN.mastery.cloverGain()

    tmp.sTierReq = MAIN.superT.req()
    tmp.seGain = MAIN.superT.seGain()
    tmp.hTierReq = MAIN.hyperT.req()
    tmp.heGain = MAIN.hyperT.heGain()

    // Luck Essence gain (keeping original logic for now)
    tmp.leGain = player.mastery_tier > 0
        ? Decimal.pow(player.max_rarity.add(1).max(1).log10().add(1), 2).mul(player.mastery_tier)
        : E(0)
})