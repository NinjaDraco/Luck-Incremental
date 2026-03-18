var tab = 0

const TABS = {
    unl_length() {
        let u = 1                                // always show Prestige tab
        if (player.rTimes > 0) u++              // Mastery tab after first Reincarnation
        if (player.mastery_tier >= 5) u++       // Luck Essence tab
        if (player.mastery_tier >= 100) u++     // Celestial tab
        if (player.aTimes > 0 || player.max_rarity.gte(100000)) u++ // Ascension tab
        return u
    },
    data: [
        { icon: '⚗️',  label: 'Prestige'       },
        { icon: '✨',  label: 'Mastery'         },
        { icon: '💠',  label: 'Luck Essence'    },
        { icon: '🌌',  label: 'Celestial'       },
        { icon: '🎇',  label: 'Ascension'       },
        { icon: '⚙️',  label: 'Settings'        },  // always visible
    ]
}

el.setup.tabs = () => {
    let h = ''
    for (let i = 0; i < TABS.data.length; i++) {
        const t = TABS.data[i]
        h += `<button id="tabbtn${i}" class="nav-btn" onclick="tab=${i}">
            <span class="nav-icon">${t.icon}</span>
            <span class="nav-label">${t.label}</span>
        </button>`
    }
    new Element('sidebar_tabs_area').setHTML(h)
}

el.update.tabs = () => {
    const u = TABS.unl_length()
    const settingsIdx = TABS.data.length - 1  // Settings is always last

    for (let i = 0; i < TABS.data.length; i++) {
        const btn = tmp.el['tabbtn' + i]
        if (!btn || !btn.el) continue

        // Show: within unlocked count OR it's the Settings tab
        const visible = (i < u) || (i === settingsIdx)
        btn.setDisplay(visible)
        btn.setClasses({ 'nav-btn': true, 'nav-btn-active': tab === i })

        if (tmp.el['tab_div' + i]) {
            tmp.el['tab_div' + i].setDisplay(tab === i)
        }
    }
}