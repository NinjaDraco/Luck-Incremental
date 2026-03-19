var tmp = {}
var tmp_update = []

function resetTemp() {
    keep = []
    tmp = {
        luckBase: 1.25,
        luckMult: E(1),
        luckPow: E(1),

        mTierEff: {},

        ppGain: E(0),
        tpGain: E(0),
        rpGain: E(0),
        apGain: E(0),
        rebGain: E(0),
        
        mTierReq: E(0),
        essGain: E(0),
        stoneGain: E(0),
        cloverGain: E(0),
        
        sTierReq: 0,
        seGain: E(0),
        
        hTierReq: 0,
        heGain: E(0),

        weatherEff: {
            luck: E(1),
            roll_interval: E(1),
            all: E(1),
        },

        upgs: {},
        el: {},
    }

    for (let id in UPGRADES) {
        tmp.upgs[id] = {
            res: E(0),
            cost: [],
            effect: [],
        }
    }
}

function updateTemp() {
    for (let x = 0; x < tmp_update.length; x++) tmp_update[x]()
}