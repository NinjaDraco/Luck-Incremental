const CHALLENGES = [
    {
        name: "Stable",
        desc: "You can't roll anything.",
        reward: () => "Boost PU2 effect based on best rarity in this challenge. Currently: " + formatMult(player.chall[0].add(1).log10().div(90).add(1).mul(player.chall[4].add(1).log10().div(90).add(1)).mul(player.chall[6].add(1).log10().div(90).add(1)).mul(player.chall[9].add(1).log10().div(90).add(1))),
        unl: () => true,
    },
    {
        name: "Unlucky",
        desc: "Your luck multiplier is 1.",
        reward: () => "Boost luck multiplier based on best rarity in this challenge. Currently: ^" + format(player.chall[1].add(1).log10().div(90).add(1).mul(player.chall[3].add(1).log10().div(90).add(1)).mul(player.chall[7].add(1).log10().div(90).add(1))),
        unl: () => player.chall[0].gte(50000),
    },
    {
        name: "No Prestige",
        desc: "You can't gain any prestige points.",
        reward: () => "Boost base prestige points based on best rarity in this challenge. Currently: ^" + format(player.chall[2].add(1).log10().div(90).add(1).mul(player.chall[3].add(1).log10().div(90).add(1)).mul(player.chall[4].add(1).log10().div(90).add(1))),
        unl: () => player.chall[1].gte(50000),
    },
    {
        name: "No Prestige + Unlucky",
        desc: "You can't gain any prestige points. Your luck multiplier is 1.",
        reward: () => "Boost rewards of subchallenges.",
        unl: () => player.chall[2].gte(50000),
    },
    {
        name: "No Prestige + Stable",
        desc: "You can't gain any prestige points. You can't roll anything.",
        reward: () => "Boost rewards of subchallenges.",
        unl: () => player.chall[3].gte(50000),
    },
    {
        name: "No Prestige & Transcend",
        desc: "You can't gain any prestige & transcension points.",
        reward: () => "Boost base transcension points based on best rarity in this challenge. Currently: ^" + format(player.chall[5].add(1).log10().div(90).add(1).mul(player.chall[6].add(1).log10().div(90).add(1)).mul(player.chall[7].add(1).log10().div(90).add(1))),
        unl: () => player.chall[4].gte(50000),
    },
    {
        name: "No Prestige & Transcend + Stable",
        desc: "You can't gain any prestige & transcension points. You can't roll anything.",
        reward: () => "Boost rewards of subchallenges.",
        unl: () => player.chall[5].gte(50000),
    },
    {
        name: "No Prestige & Transcend + Unlucky",
        desc: "You can't gain any prestige & transcension points. Your luck multiplier is 1.",
        reward: () => "Boost rewards of subchallenges.",
        unl: () => player.chall[6].gte(50000),
    },
    {
        name: "No Prestige, Transcend & Reincarnate",
        desc: "You can't gain any prestige, transcension & reincarnation points.",
        reward: () => "Boost base reincarnation points based on best rarity in this challenge. Currently: ^" + format(player.chall[8].add(1).log10().div(90).add(1).mul(player.chall[9].add(1).log10().div(90).add(1))),
        unl: () => player.chall[7].gte(50000),
    },
    {
        name: "No Prestige, Transcend & Reincarnate + Stable",
        desc: "You can't gain any prestige, transcension & reincarnation points. You can't roll anything.",
        reward: () => "Boost rewards of subchallenges.",
        unl: () => player.chall[8].gte(50000),
    },
    {
        name: "No Alpha",
        desc: "You can't gain any prestige, transcension, reincarnation & ascension points.",
        reward: () => "Boost ascension points based on best rarity in this challenge. Currently: " + formatMult(hasUpgrade('se',9)?player.chall[10].add(1).pow(player.upgrade.se[9].log10().add(1)):player.chall[10].add(1).log10().add(1)),
        unl: () => player.chall[9].gte(50000),
    },
    {
        name: "Unmastered",
        desc: "Mastery Tier do nothing. Entering this challenge will do a Super Reset.",
        reward: () => "Boost Mastery Tier's delay scaling effect based on best rarity in this challenge. Currently: " + format(player.chall[11].add(1).log10().div(90).add(1)),
        unl: () => hasUpgrade('he',10),
    },
]

function enterChall(i) {
    if (player.currentChall == i) return
    if (confirm("Entering a challenge will force a Mastery reset. Proceed?")) {
        player.currentChall = i
        if (i == 11) MAIN.superT.doReset()
        else MAIN.mastery.doReset()
    }
}

function exitChall() {
    if (player.currentChall == -1) return
    player.chall[player.currentChall] = player.chall[player.currentChall].max(player.max_rarity)
    player.currentChall = -1
    MAIN.mastery.doReset()
}

function updateChallTemp() {
    // Challenge effects are handled directly in formulas using player.chall[i]
}

function setupChallengesHTML() {
    let h = ""
    for (let i = 0; i < CHALLENGES.length; i++) {
        h += `<button class="chall-btn" id="chall${i}_btn" onclick="enterChall(${i})"></button>`
    }
    new Element("challenges").setHTML(h)
}

function updateChallengesHTML() {
    if (tab != 2) return
    
    tmp.el.unlockChall.setHTML(
		player.chall[0].lt(50000)?'Reach '+getRarityName(E(50000)).bold()+' in [Stable] to unlock next challenge':
		player.chall[1].lt(50000)?'Reach '+getRarityName(E(50000)).bold()+' in [Unlucky] to unlock next challenge':
		player.chall[2].lt(50000)?'Reach '+getRarityName(E(50000)).bold()+' in [No Prestige] to unlock next challenge':
		player.chall[3].lt(50000)?'Reach '+getRarityName(E(50000)).bold()+' in [No Prestige + Unlucky] to unlock next challenge':
		player.chall[4].lt(50000)?'Reach '+getRarityName(E(50000)).bold()+' in [No Prestige + Stable] to unlock next challenge':
		player.chall[5].lt(50000)?'Reach '+getRarityName(E(50000)).bold()+' in [No Prestige & Transcend] to unlock next challenge':
		player.chall[6].lt(50000)?'Reach '+getRarityName(E(50000)).bold()+' in [No Prestige & Transcend + Stable] to unlock next challenge':
		player.chall[7].lt(50000)?'Reach '+getRarityName(E(50000)).bold()+' in [No Prestige & Transcend + Unlucky] to unlock next challenge':
		player.chall[8].lt(50000)?'Reach '+getRarityName(E(50000)).bold()+' in [No Prestige, Transcend & Reincarnate] to unlock next challenge':
		player.chall[9].lt(50000)?'Reach '+getRarityName(E(50000)).bold()+' in [No Prestige, Transcend & Reincarnate + Stable] to unlock next challenge':
		'');

    tmp.el.currentChall.setHTML(player.currentChall == -1 ? "You are not in any challenge." : 'You are in challenge ['+CHALLENGES[player.currentChall].name+']')

    for (let i = 0; i < CHALLENGES.length; i++) {
        let ch = CHALLENGES[i]
        let unl = ch.unl()
        tmp.el["chall"+i+"_btn"].setDisplay(unl)
        if (!unl) continue

        tmp.el["chall"+i+"_btn"].setClasses({locked: player.currentChall == i, 'chall-btn': true, chosen: player.currentChall == i})
        
        let h = `
            <h4>${ch.name}</h4>
            <div>${ch.desc}</div><br>
            <div><b>Reward:</b> ${ch.reward()}</div>
            <div><b>Best:</b> ${getRarityName(player.chall[i])}</div>
        `
        tmp.el["chall"+i+"_btn"].setHTML(h)
    }
}

tmp_update.push(updateChallTemp)

el.setup.chall = setupChallengesHTML
el.update.chall = updateChallengesHTML
