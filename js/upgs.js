const UPGRADES = {
    pp: {
        tab: 0,
        res: ["PP",()=>[player,'pp'],"Prestige Points (PP)"],
        unl: ()=>player.pTimes>0,

        auto: () => hasUpgrade('rp',3),

        ctn: [
            {
                desc: () => `Increase luck by ${formatMult(upgradeEffect('pp',0)[0])} every level.`,
                cost: i => Decimal.pow(3,i),
                bulk: i => i.log(3),

                effect(i) {
                    i = i.mul(upgradeEffect('pp',3))

                    let b = Decimal.add(upgradeEffect('pp',2),2)
                    let x = b.pow(i)

                    return [b,x]
                },
                effDesc: x => formatMult(x[1]),
            },{
                desc: () => `Decrease auto-roll interval.`,
                cost: i => Decimal.pow(5,i).mul(10),
                bulk: i => i.div(10).log(5),

                effect(i) {
                    i = i.mul(upgradeEffect('pp',3))

                    let x = 1-Decimal.pow(0.8,i.root(2)).toNumber()

                    return x
                },
                effDesc: x => "-"+format(x),
            },{
                desc: () => `Increase PU1's base by +0.5 every level.`,
                cost: i => Decimal.pow(10,i).mul(1e3),
                bulk: i => i.div(1e3).log(10),

                effect(i) {
                    i = i.mul(upgradeEffect('pp',3))

                    let x = i.div(2)
                    if (hasUpgrade('tp',3)) x = x.mul(2)
                    return x
                },
                effDesc: x => "+"+format(x,1),
            },{
                unl: () => player.tTimes>0,

                desc: () => `Previous prestige upgrades are +2.5% stronger per level.`,
                cost: i => Decimal.pow(10,i.pow(2)).mul(1e18),
                bulk: i => i.div(1e18).log(10).root(2),

                effect(i) {
                    let x = i.mul(0.025).add(1)
                    return x
                },
                effDesc: x => formatPercent(x.sub(1))+" stronger",
            },{
                unl: () => player.mastery_tier>0,

                desc: () => `Double mastery essence gain.`,
                cost: i => Decimal.pow(1e5,i.pow(2)).mul(1e100),
                bulk: i => i.div(1e100).log(1e5).root(2),

                effect(i) {
                    let x = Decimal.pow(2,i)
                    return x
                },
                effDesc: x => formatMult(x),
            },
        ],
    },
    tp: {
        tab: 0,
        res: ["TP",()=>[player,'tp'],"Transcension Points (TP)"],
        unl: ()=>player.tTimes>0,

        auto: () => hasUpgrade('es',2),

        ctn: [
            {
                desc: () => `Increase luck by ${formatMult(upgradeEffect('tp',0)[0])} every level.`,
                cost: i => Decimal.pow(3,i),
                bulk: i => i.log(3),

                effect(i) {
                    i = i.mul(upgradeEffect('tp',5))

                    let b = E(10)
                    if (hasUpgrade('tp',3)) b = b.add(upgradeEffect('pp',2))
                    let x = b.pow(i)

                    return [b,x]
                },
                effDesc: x => formatMult(x[1]),
            },{
                desc: () => `Double prestige points gain.`,
                cost: i => Decimal.pow(3,i.scale(100,2,0)),
                bulk: i => i.log(3).scale(100,2,0,true),

                effect(i) {
                    i = i.mul(upgradeEffect('tp',5))

                    let x = Decimal.pow(2,i)

                    return x
                },
                effDesc: x => formatMult(x),
            },{
                desc: () => `Improve randomizer better.`,
                cost: i => Decimal.pow(10,i.pow(2)).mul(1e2),
                bulk: i => i.div(1e2).log(10).root(2),

                effect(i) {
                    i = i.mul(upgradeEffect('tp',5))

                    let x = i.add(1).root(2)

                    return x
                },
                effDesc: x => "^"+format(x),
            },{
                oneTime: true,

                desc: () => `PU3 is twice as stronger, and it affects TU1's base.`,
                cost: i => E(1e4),
            },{
                unl: () => player.rTimes>0,

                desc: () => `Post-100σ rarity scaling starts +10 later per level.`,
                cost: i => Decimal.pow(10,i.pow(1.5)).mul(1e45),
                bulk: i => i.div(1e45).log(10).root(1.5),

                effect(i) {
                    i = i.mul(upgradeEffect('tp',5))

                    let x = i.mul(10)
                    return x
                },
                effDesc: x => "+"+x.format(0)+" later",
            },{
                unl: () => player.mastery_tier>0,

                desc: () => `Previous transcension upgrades are +2.5% stronger per level.`,
                cost: i => Decimal.pow(10,i.scale(5,2,0).pow(2)).mul(1e90),
                bulk: i => i.div(1e90).log(10).root(2).scale(5,2,0,true),

                effect(i) {
                    let x = i.mul(0.025).add(1)
                    return x
                },
                effDesc: x => formatPercent(x.sub(1))+" stronger",
            },
        ],
    },
    rp: {
        tab: 0,
        res: ["RP",()=>[player,'rp'],"Reincarnation Points (RP)"],
        unl: ()=>player.rTimes>0,

        ctn: [
            {
                desc: () => `Increase luck by ${formatMult(upgradeEffect('rp',0)[0])} every level.`,
                cost: i => Decimal.pow(3,i.pow(1.25)),
                bulk: i => i.log(3).root(1.25),

                effect(i) {
                    let b = E(200)
                    let x = b.pow(i)

                    return [b,x]
                },
                effDesc: x => formatMult(x[1]),
            },{
                desc: () => `Multiply prestige points gain by 10.`,
                cost: i => Decimal.pow(3,i.pow(1.25)),
                bulk: i => i.log(3).root(1.25),

                effect(i) {
                    let x = Decimal.pow(10,i)

                    return x
                },
                effDesc: x => formatMult(x),
            },{
                desc: () => `Double trancension points gain.`,
                cost: i => Decimal.pow(3,i.pow(1.25)),
                bulk: i => i.log(3).root(1.25),

                effect(i) {
                    let x = Decimal.pow(2,i)

                    return x
                },
                effDesc: x => formatMult(x),
            },{
                oneTime: true,

                desc: () => `Automate PUs, and they no longer spend anything.`,
                cost: i => E(1e4),
            },{
                oneTime: true,

                desc: () => `Passively gain 100% of PP gained on reset every second.`,
                cost: i => E(1e9),
            },
        ],
    },
    es: {
        tab: 1,
        res: ["Mastery Essence",()=>[player,'mastery_essence'],"Mastery Essence"],
        unl: ()=>player.mastery_tier>0,

        ctn: [
            {
                desc: () => `Increase luck by ${formatMult(upgradeEffect('es',0)[0])} every level (based on mastery essence).`,
                cost: i => Decimal.pow(2,i).mul(10),
                bulk: i => i.div(10).log(2),

                effect(i) {
                    let b = player.mastery_essence.add(10).log10().mul(10)
                    let x = b.pow(i)

                    return [b,x]
                },
                effDesc: x => formatMult(x[1]),
            },{
                desc: () => `Increase PP by ${formatMult(upgradeEffect('es',1)[0])} every level (based on PP).`,
                cost: i => Decimal.pow(3,i).mul(100),
                bulk: i => i.div(100).log(3),

                effect(i) {
                    let b = player.pp.add(10).log10()
                    let x = b.pow(i)

                    return [b,x]
                },
                effDesc: x => formatMult(x[1]),
            },{
                oneTime: true,

                desc: () => `Automate TUs, and they no longer spend anything. Keep pre-mastery automation upgrades on reset.`,
                cost: i => E(1e4),
            },{
                desc: () => `Increase TP by ${formatMult(upgradeEffect('es',3)[0])} every level (based on TP).`,
                cost: i => Decimal.pow(4,i).mul(1e4),
                bulk: i => i.div(1e4).log(4),

                effect(i) {
                    let b = player.tp.add(10).log10()
                    let x = b.pow(i)

                    return [b,x]
                },
                effDesc: x => formatMult(x[1]),
            },{
                desc: () => `Increase RP by ${formatMult(upgradeEffect('es',4)[0])} every level (based on RP).`,
                cost: i => Decimal.pow(5,i).mul(1e6),
                bulk: i => i.div(1e6).log(5),

                effect(i) {
                    let b = player.rp.add(10).log10()
                    let x = b.pow(i)

                    return [b,x]
                },
                effDesc: x => formatMult(x[1]),
            },
        ],
    },
    as: {
        tab: 4,
        res: ["Ascension Energy",()=>[player,'ascension_energy'],"Ascension Energy"],
        unl: ()=>player.aTimes>0,

        ctn: [
            {
                desc: () => `Increase luck by ${formatMult(upgradeEffect('as',0)[0])} every level.`,
                cost: i => Decimal.pow(2,i).mul(10),
                bulk: i => i.div(10).log(2),

                effect(i) {
                    let b = E(1e10)
                    let x = b.pow(i)

                    return [b,x]
                },
                effDesc: x => formatMult(x[1]),
            },{
                desc: () => `Reduce Mastery Tier requirement scaling.`,
                cost: i => Decimal.pow(3,i).mul(100),
                bulk: i => i.div(100).log(3),

                effect(i) {
                    let x = Decimal.pow(0.95, i)
                    return x
                },
                effDesc: x => "-"+formatPercent(E(1).sub(x)),
            },{
                desc: () => `Automatically gain a percentage of reset currencies per second.`,
                cost: i => Decimal.pow(5,i).mul(1000),
                bulk: i => i.div(1000).log(5),

                effect(i) {
                    let x = i.mul(0.1)
                    return x
                },
                effDesc: x => "+"+formatPercent(x)+"/s",
            },
        ],
    },
}

const UPG_START_COST = (()=>{
    let x = {}
    for (let id in UPGRADES) x[id] = UPGRADES[id].ctn.map(i => i.cost(E(0)))
    return x
})()

function upgradeEffect(id,i,def=1) { return tmp.upgs[id].effect[i]||def }

function getUpgradeBought(id,i) { return player.upgrade[id][i] }
function hasUpgrade(id,i) { return player.upgrade[id][i].gte(1) }

function updateUpgradesTemp(id) {
    let us = UPGRADES[id], tu = tmp.upgs[id]

    let [p,q] = us.res[1]()

    tu.res = p[q]
    tu.noSpend = us.auto&&us.auto()

    for (let i in us.ctn) {
        let u = us.ctn[i], lvl = getUpgradeBought(id,i)

        tu.cost[i] = u.cost(lvl)
        if (u.effect) tu.effect[i] = u.effect(lvl)
    }
}

function setupUpgradesHTML(id) {
    let us = UPGRADES[id], h = ""

    h += `You have <h3 id="${id}_upgs_res">???</h3> `+us.res[2]+"<br><div>"
    for (let i in us.ctn) {
        let u = us.ctn[i]
        h += `
        <button id='${id}_upg${i}' onclick="buyUpgrade('${id}',${i})">
            ${u.desc()}
        </button>
        `
    }
    h += "</div>"
    new Element(id+"_upgrades_table").setHTML(h)
}

function updateUpgradesHTML(id) {
    let us = UPGRADES[id]

    if (tab != us.tab||0) return;
    
    let tu = tmp.upgs[id], res = tu.res, unl = !us.unl||us.unl()

    tmp.el[id+"_upgrades_table"].setDisplay(unl)

    if (!unl) return;

    tmp.el[id+"_upgs_res"].setHTML(res.format(0))

    for (let i in us.ctn) {
        let u = us.ctn[i], u_el = tmp.el[id+"_upg"+i], unl = !u.unl||u.unl()

        u_el.setDisplay(unl)

        if (!unl) continue;

        let lvl = getUpgradeBought(id,i), cost = tu.cost[i], h = ""

        if (!u.oneTime) h += "[Level " + lvl.format(0) + "]<br>" 
        h += u.desc()
        if (u.effDesc) h += "<br> Effect: " + u.effDesc(tu.effect[i]).bold()
        if (!u.oneTime || lvl.lt(1)) h += "<br>Cost: " + cost.format(0) + " " + us.res[0]

        u_el.setClasses({locked: res.lt(cost) || (u.oneTime && lvl.gte(1))})
        u_el.setHTML(h)
    }
}

function buyUpgrade(id,i) {
    let u = UPGRADES[id], tu = tmp.upgs[id], res = tu.res, cost = tu.cost[i], uu = u.ctn[i]

    if (player.upgrade[id][i].gte(1) && uu.oneTime) return;

    if (res.gte(cost)) {
        if (uu.oneTime) {
            if (!tu.noSpend) {
                let [p,q] = u.res[1]()
                p[q] = p[q].sub(cost)
            }

            player.upgrade[id][i] = E(1)
        } else {
            let bulk = u.ctn[i].bulk(res).add(1).floor()

            if (getUpgradeBought(id,i).lt(bulk)) {
                if (!tu.noSpend) {
                    cost = u.ctn[i].cost(bulk.sub(1))

                    let [p,q] = u.res[1]()
                    p[q] = p[q].sub(cost)
                }

                player.upgrade[id][i] = bulk
            }
        }

        updateUpgradesTemp(id)
    }
}

function resetUpgrades(id, keep=[]) {
    for (let i in UPGRADES[id].ctn) if (!keep.includes(parseInt(i))) player.upgrade[id][i] = E(0)
}

tmp_update.push(()=>{
    for (let id in UPGRADES) {
        updateUpgradesTemp(id)
    }
})

el.setup.upgs = ()=>{
    for (let id in UPGRADES) {
        setupUpgradesHTML(id)
    }
}

el.update.upgs = ()=>{
    for (let id in UPGRADES) {
        updateUpgradesHTML(id)
    }
}