const LUCK = {
    mult() {
        if (player.currentChall == 1 || player.currentChall == 3 || player.currentChall == 7) return E(1)
        let x = E(1)

        x = x.mul(upgradeEffect('pp',0)[1]).mul(upgradeEffect('tp',0)[1]).mul(upgradeEffect('rp',0)[1]).mul(upgradeEffect('ap',0)[1]).mul(upgradeEffect('es',0)[1])
        
        x = x.pow(tmp.mTierEff.luck||1).pow(player.chall[1].add(1).log10().div(90).add(1).mul(player.chall[3].add(1).log10().div(90).add(1)).mul(player.chall[7].add(1).log10().div(90).add(1))).pow(upgradeEffect('se',2))

        return x
    },
    pow() {
        let x = E(1)

        x = x.mul(upgradeEffect('tp',2)).mul(upgradeEffect('rp',6)).mul(upgradeEffect('es',8)).mul(upgradeEffect('se',8)).mul(upgradeEffect('reb',5))

        return x
    },
    generate() {
        let r = Decimal.pow(Math.random(),-1).pow(tmp.luckPow).mul(tmp.luckMult).log(tmp.luckBase).scale(tmp.raritySS,2,0,true)

        while(Decimal.isNaN(r)) r = Decimal.pow(Math.random(),-1).pow(tmp.luckPow).mul(tmp.luckMult).log(tmp.luckBase).scale(tmp.raritySS,2,0,true)
            
        return r.floor()
    },
    generateBulk(step) {
        let mult = E(1)
        if(step.gte(1e6)){
            mult = step.div(1e6)
            step = E(1e6)
        }
        
        let r = Decimal.pow(E(1).sub(Decimal.pow(Math.random(),step.pow(-1))),-1).mul(mult).pow(tmp.luckPow).mul(tmp.luckMult).log(tmp.luckBase).scale(tmp.raritySS,2,0,true)
        
        while(Decimal.isNaN(r)) r = Decimal.pow(E(1).sub(Decimal.pow(Math.random(),step.pow(-1))),-1).mul(mult).pow(tmp.luckPow).mul(tmp.luckMult).log(tmp.luckBase).scale(tmp.raritySS,2,0,true)
            
        return r.floor()
    },
    update() {
        let r = E(1).pow(tmp.luckPow).mul(tmp.luckMult).log(tmp.luckBase).scale(tmp.raritySS,2,0,true)

        return r.floor()
    },
}

function mTierSS(){
    if(player.currentChall == 11) return E(0);
    if(hasUpgrade('se',4)) return E(player.mastery_tier).pow(2).div(100).mul(player.upgrade.se[4].pow(0.1)).mul(upgradeEffect('st',15)).mul(player.chall[11].add(1).log10().div(90).add(1));
    if(player.mastery_tier>=80) return E(player.mastery_tier).pow(2).div(160).mul(upgradeEffect('st',15)).mul(player.chall[11].add(1).log10().div(90).add(1));
    return E(0);
}

const RARITY_PREFIX = [
    ["Common","Uncommon","Rare",'Unique',"Epic","Legendary",'Mythic','Divine','Almighty','Phenomenal','Preeminent','Inlimitable','Exotic','Ethereal','Scarce','Superior','Astronia','Affinity','Noviax','Endre','Abyxtic'],
    ['',"Kilo","Mega","Giga",'Tera','Peta','Exa','Zetta','Yotta','Xenna','Weka','Vendeka','Uda','Tradaka','Sorta','Rinta','Quexa','Pepta','Ocha','Nena','Minga','Luma','Kema','Jretta','Iqatta','Huitta','Gatextta','Feqesa','Encsenda','Desyta','Ceanata','Bevvgta','Avta'],
    ['','Meta','Hyper','Ultra','Omni','Mesko','Omega'],
]
const RP_LENS = RARITY_PREFIX.map(x=>x.length)

var show_luck_nav = true

function getRarityName(i) {
    let h = ''

    i = E(i).floor()

    if (i.lt(9e15)) {
        i = i.toNumber()

        let a = Math.floor(i / RP_LENS[0])
    
        if (a>0) h += a < RP_LENS[1] ? RARITY_PREFIX[1][a]+"-" : 'Arch'+format(a,0).sup()+'-'
        h += RARITY_PREFIX[0][i%RP_LENS[0]]
    } else {
        let m = i.layer
        if (m>0) h += (m < RP_LENS[2] ? RARITY_PREFIX[2][m] : 'Lode'+format(m,0).sup()) + (m<9e15?"-":"")

        if (m<9e15) {
            let p = Math.max(i.mag-15.954242509439325), q = Math.floor((p%1)*RP_LENS[0]), a = Math.floor(p)
        
            if (a>0) h += a < RP_LENS[1] ? RARITY_PREFIX[1][a]+"-" : 'Arch'+format(a,0).sup()+'-'
            h += RARITY_PREFIX[0][q%RP_LENS[0]]
        }
    }

    return h+` [${format(i,0)}σ]`
}

function getRarityChance(i) {
    let x = Decimal.pow(tmp.luckBase,i.scale(tmp.raritySS,2,0)).div(tmp.luckMult).root(tmp.luckPow)

    return x.max(1)
}

function roll() {
    if(player.currentChall == 0 || player.currentChall == 4 || player.currentChall == 6 || player.currentChall == 9){
		if (tmp.el.rolled_label) {
            tmp.el.rolled_label.setHTML(`
            <div style="font-size:12px; letter-spacing:3px; text-transform:uppercase; color:var(--text-secondary); margin-bottom:4px">CURRENT MAX</div>
            <div style="font-size:24px; color:var(--accent);">${getRarityName(player.max_rarity)}</div>
            `)
        } else {
            tmp.el.rolled_div.setHTML(`You can't roll in this challenge.<br><h1>${getRarityName(player.max_rarity)}</h1>`)
        }
		player.roll_time = 0; return;
	}

    let r = LUCK.generate()
    let times = E(player.roll_time).div(tmp.rollInt).floor().max(1)
	
	if(times.gte(100000)) player.roll_time = 0
    else player.roll_time -= tmp.rollInt.mul(times).toNumber();
	
	if(times.gte(101)){
		let step = times.sub(1).div(50).floor();
		let remaining = times.sub(1);
		while(remaining.gte(step)){
			r = r.max(LUCK.generateBulk(step));
			remaining = remaining.sub(step);
		}
		if(remaining.gte(1)) r = r.max(LUCK.generateBulk(remaining));
	} else if(times.gte(2)){
		let remaining = times.toNumber()-1;
		while(remaining >= 1){
			r = r.max(LUCK.generate())
			remaining--;
		}
	}

    let isJackpot = r.gt(player.max_rarity) && (r.sub(player.max_rarity).gte(5) || r.gte(1000));

    player.max_rarity = player.max_rarity.max(r)

    // Grant Luck Essence for rolls exceeding 100σ
    if (r.gte(100) && player.luck_essence !== undefined) {
        let leBonus = r.sub(99).log10().add(1).mul(player.mastery_tier > 0 ? player.mastery_tier : 1)
        player.luck_essence = player.luck_essence.add(leBonus)
    }

    // Update the inner label in the new HTML
    if (tmp.el.rolled_label) {
        let rollClass = isJackpot ? 'roll-jackpot' : 'roll-glitch';
        tmp.el.rolled_label.setHTML(`
        <div class="${rollClass}">
            <div style="font-size:12px; letter-spacing:3px; text-transform:uppercase; color:var(--text-secondary); margin-bottom:4px">YOU ROLLED</div>
            <div class="roll-result-name" style="color:var(--accent);">${getRarityName(r)}</div>
        </div>
        `)
        
        // Remove the animation classes after they finish
        setTimeout(() => {
            if (tmp.el.rolled_label && tmp.el.rolled_label.el.querySelector(`.${rollClass}`)) {
                tmp.el.rolled_label.el.querySelector(`.${rollClass}`).classList.remove(rollClass);
            }
        }, isJackpot ? 1500 : 400);

    } else {
        tmp.el.rolled_div.setHTML(`You rolled:<br><h1>${getRarityName(r)}</h1>`)
    }

    if(player.roll_time < 0) player.roll_time = 0
}

tmp_update.push(()=>{
    tmp.raritySS = E(100).add(upgradeEffect('tp',4,0)).add(upgradeEffect('pp',6,0)).add(mTierSS())

    tmp.luckBase = 1.25
    tmp.rollInt = upgradeEffect('pp',1).pow(-1).mul(tmp.weatherEff.roll_interval)
    tmp.luckMult = LUCK.mult()
    tmp.luckPow = LUCK.pow()
})

var luck_update_tick = 0
el.update.luck = () => {
    luck_update_tick++
    if (luck_update_tick < 10) return
    luck_update_tick = 0

    let mr = player.max_rarity
    tmp.el.luck_list.setDisplay(show_luck_nav)

    if (show_luck_nav) {
        if (!tmp.luck_cache) tmp.luck_cache = []
        for (let i = 0; i < 8; i++) {
            let m = mr.add(i)
            if (tmp.luck_cache[i] && tmp.luck_cache[i].eq(m)) continue
            tmp.luck_cache[i] = m

            let lc = tmp.el['luck_ctn'+i]
            lc.setDisplay(i == 0 || m.lt(9e15))
            if (i > 0 && m.gte(9e15)) continue

            lc.setHTML(`<h4>${getRarityName(m)}</h4> 1 / ${getRarityChance(m).format()}`)
        }
    }

    tmp.el.roll_btn.setHTML("Roll ("+format(Math.max(tmp.rollInt.toNumber()-player.roll_time,0),1)+"s)")
}
