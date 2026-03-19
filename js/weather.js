const WEATHER = {
    types: {
        none: {
            name: "Clear",
            color: "white",
            effect: (rng) => ({}),
        },
        rain: {
            name: "Rain",
            color: "#4a90e2",
            effect: (rng) => ({ luck: Decimal.pow(1.5, rng).mul(2) }),
            msg: (rng) => `Luck is boosted by ${formatMult(Decimal.pow(1.5, rng).mul(2))}`
        },
        snow: {
            name: "Snow",
            color: "#f0f8ff",
            effect: (rng) => ({ all: Decimal.pow(1.3, rng).mul(1.5) }),
            msg: (rng) => `All stats are boosted by ${formatMult(Decimal.pow(1.3, rng).mul(1.5))}`
        },
        storm: {
            name: "Storm",
            color: "#f5a623",
            effect: (rng) => ({ luck: Decimal.pow(2, rng).mul(3), all: Decimal.pow(1.5, rng).mul(2) }),
            msg: (rng) => `Luck & All stats are boosted by ${formatMult(Decimal.pow(2, rng).mul(3))} & ${formatMult(Decimal.pow(1.5, rng).mul(2))}`
        },
        sunny: {
            name: "Sunny",
            color: "#f8e71c",
            effect: (rng) => ({ all: Decimal.pow(1.4, rng).mul(2) }),
            msg: (rng) => `All stats are boosted by ${formatMult(Decimal.pow(1.4, rng).mul(2))}`
        },
        windy: {
            name: "Windy",
            color: "#7ed321",
            effect: (rng) => ({ roll_interval: Decimal.pow(0.9, rng).mul(0.8) }),
            msg: (rng) => `Roll interval is reduced by ${formatMult(Decimal.pow(0.9, rng).mul(0.8), 2)}`
        },
        aurora: {
            name: "Aurora",
            color: "#bd10e0",
            rare: true,
            effect: (rng) => ({ all: Decimal.pow(2.5, rng).mul(5) }),
            msg: (rng) => `ALL STATS are boosted by ${formatMult(Decimal.pow(2.5, rng).mul(5))}`
        },
    },
    update(dt) {
        if (!player.weather) player.weather = []

        // Update active weathers
        for (let i = 0; i < player.weather.length; i++) {
            player.weather[i].duration -= dt
            if (player.weather[i].duration <= 0) {
                player.weather.splice(i, 1)
                i--
            }
        }

        // Trigger new weather
        if (Math.random() < dt * 0.05) { // ~ once every 20s average
            this.trigger()
        }
    },
    trigger() {
        if (!player.weather) player.weather = []
        
        let weather_count_rng = Math.random()
        let max_weathers = 1
        if (weather_count_rng < 0.05) max_weathers = 3
        else if (weather_count_rng < 0.2) max_weathers = 2

        if (player.weather.length >= max_weathers) return

        let rng = Math.random() * 5 + 1 // higher rng give higher stats multi
        let duration = Math.random() * 29 + 1 // 1 to 30 second

        let keys = Object.keys(this.types).filter(k => k !== 'none')
        let id = keys[Math.floor(Math.random() * keys.length)]

        // Check if rare
        if (this.types[id].rare && Math.random() > 0.1) {
             id = keys[Math.floor(Math.random() * keys.length)] // reroll if rare
             if (this.types[id].rare && Math.random() > 0.1) id = 'rain' // fallback
        }

        // Avoid duplicates
        if (player.weather.find(w => w.id === id)) return

        player.weather.push({
            id: id,
            duration: duration,
            rng: rng
        })
    },
    getEffects() {
        let eff = {
            luck: E(1),
            roll_interval: E(1),
            all: E(1),
        }

        if (!player.weather) return eff

        for (let w of player.weather) {
            let type = this.types[w.id]
            if (type) {
                let wEff = type.effect(w.rng)
                for (let k in wEff) {
                    eff[k] = eff[k].mul(wEff[k])
                }
            }
        }

        return eff
    },
    draw() {
        if (!tmp.el.weather_display) return
        
        if (!player.weather || player.weather.length === 0) {
            tmp.el.weather_display.setHTML("")
            this.last_structure = ""
            return
        }

        let mainColor = "#4a90e2"
        let rareActive = player.weather.find(w => this.types[w.id].rare)
        if (rareActive) mainColor = this.types[rareActive.id].color
        else if (player.weather.length > 0) mainColor = this.types[player.weather[0].id].color

        // Check if the structure (excluding timers) changed
        let structure = player.weather.map(w => w.id + "_" + w.rng).join(",") + mainColor
        if (this.last_structure !== structure) {
            this.last_structure = structure
            let h = `<div class="weather-banner" style="border-color: ${mainColor}; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px ${mainColor}55">`
            for (let i = 0; i < player.weather.length; i++) {
                let w = player.weather[i]
                let type = this.types[w.id]
                h += `
                <div class="weather-banner-item">
                    <div class="weather-banner-info">
                        <div class="weather-banner-name" style="color: ${type.color}">${type.name}</div>
                        <div class="weather-banner-desc">${type.msg(w.rng)}</div>
                    </div>
                    <div class="weather-banner-timer" id="weather_timer_${i}">${format(w.duration, 1)}s</div>
                </div>
                `
            }
            h += `</div>`
            tmp.el.weather_display.setHTML(h)
        }

        // Update timers separately to avoid restarting the entrance animation
        for (let i = 0; i < player.weather.length; i++) {
            let timerEl = document.getElementById(`weather_timer_${i}`)
            if (timerEl) {
                let t = format(player.weather[i].duration, 1) + "s"
                if (timerEl.innerText !== t) timerEl.innerText = t
            }
        }
    }
}

tmp_update.push(()=>{
    tmp.weatherEff = WEATHER.getEffects()
})

el.update.weather = () => {
    WEATHER.draw()
}
