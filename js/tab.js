var tab = 0

const TABS = {
    unl(i) {
        if (i === 0 || i === 8) return true          // Main and Settings
        if (i === 1) return player.rTimes > 0       // Mastery tab
        if (i === 2) return hasUpgrade('es', 14)    // Challenges tab
        if (i === 3) return player.mastery_tier >= 100 || player.super_tier > 0 // Super Tier
        if (i === 4) return player.super_tier >= 100 || player.hyper_tier > 0  // Hyper Tier
        if (i === 5) return player.mastery_tier >= 5  // Luck Essence tab
        if (i === 6) return player.hyper_tier >= 200 // Celestial tab
        if (i === 7) return player.pTimes > 0        // Rune tab
        return false
    },
    data: [
        { icon: '✨',  label: 'Main'            },
        { icon: '🔮',  label: 'Mastery'         },
        { icon: '⚔️',  label: 'Challenges'      },
        { icon: '🌌',  label: 'Super Tier'       },
        { icon: '🚀',  label: 'Hyper Tier'       },
        { icon: '💠',  label: 'Luck Essence'    },
        { icon: '✨',  label: 'Celestial'       },
        { icon: '💠',  label: 'Runes'           },
        { icon: '⚙️',  label: 'Settings'        },
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
    for (let i = 0; i < TABS.data.length; i++) {
        const btn = tmp.el['tabbtn' + i]
        if (!btn || !btn.el) continue

        const visible = TABS.unl(i)
        btn.setDisplay(visible)
        btn.setClasses({ 'nav-btn': true, 'nav-btn-active': tab === i })

        if (tmp.el['tab_div' + i]) {
            tmp.el['tab_div' + i].setDisplay(tab === i)
        }
    }
}
