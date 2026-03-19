function E(x){return new Decimal(x)};

const EINF = Decimal.dInf
const FPS = 30
const SAVE_ID = 'luck_incremental_save'

Math.lerp = function (value1, value2, amount) {
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return value1 + (value2 - value1) * amount;
};

Decimal.prototype.clone = function() {
    return this
}

Decimal.prototype.modular=Decimal.prototype.mod=function (other){
    other=E(other);
    if (other.eq(0)) return E(0);
    if (this.sign*other.sign==-1) return this.abs().mod(other.abs()).neg();
    if (this.sign==-1) return this.abs().mod(other.abs());
    return this.sub(this.div(other).floor().mul(other));
};

Decimal.prototype.softcap = function (start, power, mode) {
    var x = this.clone()
    if (x.gte(start)) {
        if ([0, "pow"].includes(mode)) x = x.div(start).pow(power).mul(start)
        if ([1, "mul"].includes(mode)) x = x.sub(start).div(power).add(start)
        if ([2, "exp"].includes(mode)) x = expMult(x.div(start), power).mul(start)
    }
    return x
}

function scale(x, s, p, mode, rev=false) {
    s = E(s)
    p = E(p)
    if (x.gte(s)) {
        if ([0, "pow"].includes(mode)) x = rev ? x.mul(s.pow(p.sub(1))).root(p) : x.pow(p).div(s.pow(p.sub(1)))
        if ([1, "exp"].includes(mode)) x = rev ? x.div(s).max(1).log(p).add(s) : Decimal.pow(p,x.sub(s)).mul(s)
    }
    return x
}

Decimal.prototype.scale = function (s, p, mode, rev=false) {
    s = E(s)
    p = E(p)
    var x = this.clone()
    if (x.gte(s)) {
        if ([0, "pow"].includes(mode)) x = rev ? x.mul(s.pow(p.sub(1))).root(p) : x.pow(p).div(s.pow(p.sub(1)))
        if ([1, "exp"].includes(mode)) x = rev ? x.div(s).max(1).log(p).add(s) : Decimal.pow(p,x.sub(s)).mul(s)
    }
    return x
}

Decimal.prototype.format = function (acc=2, max=9) { return format(this.clone(), acc, max) }

Decimal.prototype.formatGain = function (gain, mass=false) { return formatGain(this.clone(), gain, mass) }

function softcapHTML(x, start) { return E(x).gte(start)?` <span class='soft'>(softcapped)</span>`:"" }

Decimal.prototype.softcapHTML = function (start) { return softcapHTML(this.clone(), start) }

function sumBases(a,n,m=1) {
    return Decimal.pow(a,n+1).sub(1).div(a-1).mul(m)
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function getPlayerData() {
    let s = {
        max_rarity: E(0),
        time: 0,
        roll_time: 0,

        upgrade: {},

        pp: E(0),
        pTimes: 0,

        tp: E(0),
        tTimes: 0,

        rp: E(0),
        rTimes: 0,

        ap: E(0),
        aTimes: 0,

        reb: E(0),

        luck_essence: E(0),

        mastery_tier: 0,
        mastery_essence: E(0),
        mastery_stone: E(0),
        mastery_clover: E(0),
        
        super_tier: 0,
        super_essence: E(0),
        
        hyper_tier: 0,
        hyper_essence: E(0),

        runes: {
            unl: false,
            packs: {
                pp: { lvl: E(0), progress: E(0), queue: 0 },
                tp: { lvl: E(0), progress: E(0), queue: 0 },
                rp: { lvl: E(0), progress: E(0), queue: 0 },
                ma: { lvl: E(0), progress: E(0), queue: 0 },
                as: { lvl: E(0), progress: E(0), queue: 0 },
            },
            upgs: {
                speed: E(0),
                bulk: E(0),
                clone: E(0),
                luck: E(0),
                auto_pack: "none",
            },
            items: {
                pp_add: E(0), pp_mult: E(1), pp_exp: E(1),
                tp_add: E(0), tp_mult: E(1), tp_exp: E(1),
                rp_add: E(0), rp_mult: E(1), rp_exp: E(1),
                ma_add: E(0), ma_mult: E(1), ma_exp: E(1),
                as_add: E(0), as_mult: E(1), as_exp: E(1),
            }
        },

        chall: [],
        currentChall: -1,
    }
    for (let id in UPGRADES) s.upgrade[id] = new Array(UPGRADES[id].ctn.length).fill(E(0))
    for (let id in CHALLENGES) s.chall[id] = E(0)
    return s
}

function wipe(reload=false) {
    if (reload) {
        wipe()
        save()
        resetTemp()
        loadGame(false)
    }
    else player = getPlayerData()
}

function loadPlayer(load) {
    const DATA = getPlayerData()
    player = deepNaN(load, DATA)
    player = deepUndefinedAndDecimal(player, DATA)
    convertStringToDecimal()
}

function deepNaN(obj, data) {
    for (let x = 0; x < Object.keys(obj).length; x++) {
        let k = Object.keys(obj)[x]
        if (typeof obj[k] == 'string') {
            if (data[k] == null || data[k] == undefined ? false : Object.getPrototypeOf(data[k]).constructor.name == "Decimal") if (isNaN(E(obj[k]).mag)) obj[k] = data[k]
        } else {
            if (typeof obj[k] != 'object' && isNaN(obj[k])) obj[k] = data[k]
            if (typeof obj[k] == 'object' && data[k] && obj[k] != null) obj[k] = deepNaN(obj[k], data[k])
        }
    }
    return obj
}

function deepUndefinedAndDecimal(obj, data) {
    if (obj == null) return data
    for (let x = 0; x < Object.keys(data).length; x++) {
        let k = Object.keys(data)[x]
        if (obj[k] === null) continue
        if (obj[k] === undefined) obj[k] = data[k]
        else {
            if (Object.getPrototypeOf(data[k]).constructor.name == "Decimal") obj[k] = E(obj[k])
            else if (typeof obj[k] == 'object') deepUndefinedAndDecimal(obj[k], data[k])
        }
    }
    return obj
}

function convertStringToDecimal() {
    
}

function cannotSave() { return false }

function save(){
    let str = btoa(JSON.stringify(player))
    if (cannotSave() || findNaN(str, true)) return
    if (localStorage.getItem(SAVE_ID) == '') wipe()
    localStorage.setItem(SAVE_ID,str)
    tmp.prevSave = localStorage.getItem(SAVE_ID)
    console.log("Game Saved")
}

function load(x){
    if(typeof x == "string" & x != ''){
        loadPlayer(JSON.parse(atob(x)))
    } else {
        wipe()
    }
}

function exporty() {
    let str = btoa(JSON.stringify(player))
    if (findNaN(str, true)) {
        console.warn("Error Exporting, because it got NaNed")
        return
    }
    save();
    let file = new Blob([str], {type: "text/plain"})
    window.URL = window.URL || window.webkitURL;
    let a = document.createElement("a")
    a.href = window.URL.createObjectURL(file)
    a.download = "Test Save - "+new Date().toGMTString()+".txt"
    a.click()
}

function export_copy() {
    let str = btoa(JSON.stringify(player))
    if (findNaN(str, true)) {
        console.warn("Error Exporting, because it got NaNed")
        return
    }

    let copyText = document.getElementById('copy')
    copyText.value = str
    copyText.style.visibility = "visible"
    copyText.select();
    document.execCommand("copy");
    copyText.style.visibility = "hidden"
    console.log("Exported to clipboard")
}

function importy() {
    let loadgame = prompt("Paste in your save WARNING: WILL OVERWRITE YOUR CURRENT SAVE")
        if (loadgame != null) {
            let keep = player
            try {
                setTimeout(()=>{
                    if (findNaN(loadgame, true)) {
                        console.warn("Error Importing, because it got NaNed")
                        return
                    }
                    load(loadgame)
                    save()
                    resetTemp()
                    loadGame(false)
                    location.reload()
                }, 200)
            } catch (error) {
                console.error("Error Importing")
                player = keep
            }
        }
}

function loadGame(start=true, gotNaN=false) {
    if (!gotNaN) tmp.prevSave = localStorage.getItem(SAVE_ID)
    wipe()
    load(tmp.prevSave)
    resetTemp()
    setupHTML()
    
    if (start) {
        for (let x = 0; x < 50; x++) updateTemp()
        setInterval(save,60000)
        setInterval(loop, 1000/FPS)
        setInterval(checkNaN,1000)

        setTimeout(
            ()=>{
                tmp.el.app.setDisplay(true)
            }
        ,100)
    }
}

function checkNaN() {
    if (findNaN(player)) {
        console.warn("Game Data got NaNed")

        resetTemp()
        loadGame(false, true)
    }
}

function findNaN(obj, str=false, data=getPlayerData()) {
    if (str ? typeof obj == "string" : false) obj = JSON.parse(atob(obj))
    for (let x = 0; x < Object.keys(obj).length; x++) {
        let k = Object.keys(obj)[x]
        if (typeof obj[k] == "number") if (isNaN(obj[k])) return true
        if (str) {
            if (typeof obj[k] == "string") if (data[k] == null || data[k] == undefined ? false : Object.getPrototypeOf(data[k]).constructor.name == "Decimal") if (isNaN(E(obj[k]).mag)) return true
        } else {
            if (obj[k] == null || obj[k] == undefined ? false : Object.getPrototypeOf(obj[k]).constructor.name == "Decimal") if (isNaN(E(obj[k]).mag)) return true
        }
        if (typeof obj[k] == "object") return findNaN(obj[k], str, data[k])
    }
    return false
}