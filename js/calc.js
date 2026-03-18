function calc(dt) {
    player.time += dt
    player.roll_time += dt

    if (player.roll_time >= tmp.rollInt) {
        roll()
    }

    for (let i in UPGRADES) {
        let a = UPGRADES[i].auto
        if (a&&a()) for (let j in UPGRADES[i].ctn) buyUpgrade(i,j)
    }

    if (hasUpgrade('rp',4)) player.pp = player.pp.add(tmp.ppGain.mul(dt))

    player.mastery_essence = player.mastery_essence.add(tmp.essGain.mul(dt))

    // Passive Luck Essence generation (unlocks after Mastery Tier 5)
    if (player.mastery_tier >= 5 && tmp.leGain) {
        player.luck_essence = player.luck_essence.add(tmp.leGain.mul(dt))
    }

    if (hasUpgrade('as',2)) {
        let asEff = upgradeEffect('as',2)
        if (player.pTimes > 0) player.pp = player.pp.add(tmp.ppGain.mul(asEff).mul(dt))
        if (player.tTimes > 0) player.tp = player.tp.add(tmp.tpGain.mul(asEff).mul(dt))
        if (player.rTimes > 0) player.rp = player.rp.add(tmp.rpGain.mul(asEff).mul(dt))
    }
}