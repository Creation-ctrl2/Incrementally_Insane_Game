const SAVE_KEY = "IncrementalThing"
let points = 0
let base = {
	"pps": 1,
	"time": 1000
}
let stats = {
    "pps": 1,
    "time": 1000
}
let upgrades = [
    {
        "id": 0,
        "name": "Starter",
        "description": `We all started here.
        +1 points per second.`,
		  "bsc": 10,
        "cost": 10,
        "count": 0,
        "max": 15,
        "scale": 1.1,
        "boosts": [
            {
                "boost": "pps",
                "effect": 1,
                "type": "add"
            }
        ]
    },
    {
        "id": 1,
        "name": "Speeding up",
        "description": `More!
        +2 points per second.`,
		  "bsc": 30,
        "cost": 30,
        "count": 0,
        "max": 10,
        "scale": 1.15,
        "boosts": [
            {
                "boost": "pps",
                "effect": 2,
                "type": "add"
            }
        ]
    },
    {
        "id": 2,
        "name": "Less waiting",
        "description": `Patience is a sham.
        Remove 1ms of cooldown every level.`,
		  "bsc": 55,
        "cost": 55,
        "count": 0,
        "max": 20,
        "scale": 1.03,
        "boosts": [
            {
                "boost": "time",
                "effect": 1,
                "type": "subtract"
            }
        ]
    },
	 {
        "id": 3,
        "name": "Big boost!",
        "description": `It's actually big BOOSTS.
        Every level removes 5ms of pointgen cooldown and adds 10 points per second AND x1.01 points.`,
		  "bsc": 100,
        "cost": 100,
        "count": 0,
        "max": 20,
        "scale": 1.03,
        "boosts": [
            {
                "boost": "time",
                "effect": 5,
                "type": "subtract"
            },
			  {
			  		"boost": "pps",
					"effect": 1.01,
					"type": "multiply"
			  },
			  {
			  		"boost": "pps",
					"effect": 10,
					"type": "add"
			  }
        ]
    },
	 {
        "id": 4,
        "name": "Cost-benefit analysis",
        "description": `Double your points per second, but multiply pointgen cooldown by 1.1`,
		  "bsc": 100,
        "cost": 100,
        "count": 0,
        "max": 1,
        "scale": 1,
        "boosts": [
            {
                "boost": "pps",
                "effect": 2,
                "type": "multiply"
            },
			  {
			  		"boost": "time",
					"effect": 1.1,
					"type": "multiply"
			  }
        ]
    },
	{
		"id": 5,
		"name": "One must imagine Sisyphus happy.",
		"description": `Double your point gain, but divide point gain by 1.995.`,
		"bsc": 250,
		"cost": 250,
		"count": 0,
		"max": 30,
		"scale": 1.05,
		"boosts": [
			{
				"boost": "pps",
				"effect": 2,
				"type": "multiply"
			},
			{
				"boost": "pps",
				"effect": 1.995,
				"type": "divide"
			}
		]
	},
	{
	    "id": 6,
		"name": "How much points do you want?!",
		"description": "Multiply point gain by 1.001 every level.",
	    "bsc": 1000,
	    "cost": 1000,
	    "count": 0,
	    "max": 100,
	    "scale": 1.002,
	    "boosts": [
	        {
		        "boost": "pps",
				"effect": 1.001,
				"type": "multiply"
             }
	    ]
	},
	{
		"id": 7,
		"name": "Ooooh! Synergizing!",
		"description": "Points boost points. Formula: log10(pps / 2.5).",
		"bsc": 2500,
		"cost": 2500,
		"count": 0,
		"max": 1,
		"scale": 1,
		"boosts": [
			{
				"boost": "pps",
				"formula": "Math.log10(stats.pps / 2.5)",
				"effect": 1,
				"type": "multiply",
				"synergizes": true
			}
		]
	}
]
function showPoints() {
    document.getElementById('pts').innerText = `You have ${points.toFixed(2)} points! (${stats.pps.toFixed(2)} points / ${stats.time / 1000} s)`
	for (let u of upgrades) {
		document.getElementById(`upg${u.id}`).classList.toggle("locked", u.cost > points && u.count < u.max)
		document.getElementById(`upg${u.id}`).classList.toggle("maxed", u.count >= u.max)
	}
}
function applyBoosts(bo) {
	for (let b of bo) {
		if (b.synergizes || b.effect < 0) continue
        if (b.type === "add") stats[b.boost] += b.effect
        else if (b.type === "subtract") stats[b.boost] -= b.effect
		else if (b.type === "multiply") stats[b.boost] *= b.effect
		else if (b.type === "divide") stats[b.boost] /= (b.effect !== 0 ? b.effect : 1)
		
        if (b.boost === "time") reset()
    }
	applySynergizedBoosts(bo)
}
function applySynergizedBoosts(bo) {
    let synergized = bo.filter(b => b.synergizes)
    for (let b of synergized) {
		// I know, I know, eval is evil, but I gotta.
		b.effect = eval(b.formula)
		if (b.type === "add") stats[b.boost] += b.effect
        else if (b.type === "subtract") stats[b.boost] -= b.effect
		else if (b.type === "multiply") stats[b.boost] *= b.effect
		else if (b.type === "divide") stats[b.boost] /= (b.effect !== 0 ? b.effect : 1)
		
        if (b.boost === "time") reset()
	}
}
function buyUpg(id) {
    let idx = upgrades.findIndex(u => u.id === id)
    if (idx < 0) throw new ReferenceError(`Unable to find upgrade ${id}!`)
    let up = upgrades[idx]
    if (up.count >= up.max) return
    else if (points < up.cost) {
        const button = document.getElementById(`upg${id}`)
        button.innerText = "Cannot afford!"
        setTimeout(() => {
            renderUpgrades()
        }, 1000)
        return
    }
    else {
        points -= up.cost
        up.count++
        up.cost = Math.floor(up.cost * up.scale)
        applyBoosts(up.boosts, up.count)
		renderUpgrades()
        showPoints()
		localStorage.setItem(SAVE_KEY, getSaveStr())
        return
    }
}
function renderUpgrades() {
    document.getElementById('container').innerHTML = ""
    upgrades.forEach((upg) => {
        let btn = document.createElement('button')
        btn.innerText = `${upg.name}\n${upg.description}\n${upg.count >= upg.max ? "MAXED" : upg.cost + " points"}\n${upg.count} / ${upg.max}`
        btn.id = `upg${upg.id}`
        btn.className = `pts`
        btn.addEventListener("click", function() {
            buyUpg(upg.id)
        })
        if (upg.count >= upg.max) btn.classList.add("maxed")
		else if (points < upg.cost) btn.classList.add("locked")
		document.getElementById('container').appendChild(btn)
    })
}
renderUpgrades()
showPoints()
let loop = setInterval(function() {
    points += stats.pps
    showPoints()
}, Math.max(1, stats.time)j
let s = localStorage.getItem(SAVE_KEY)
if (s) loadSaveStr(s)
let save = setInterval(() => localStorage.setItem(SAVE_KEY, getSaveStr()), 5000)
function reset() {
    clearInterval(loop)
    loop = setInterval(function() {
        points += stats.pps
        showPoints()
    }, Math.max(1, stats.time))
}
function getSaveStr() {
	let stat = { points, "upgrades": upgrades.map(u => ({"id": u.id, "count": u.count})) }
	stat = JSON.stringify(stat)
	stat = btoa(stat)
	return stat
}
function loadSaveStr(save) {
	try {
		let decoded = JSON.parse(atob(save.trim()))
		if (
			typeof decoded.points !== "number" ||
			!Number.isFinite(decoded.points) ||
			decoded.points < 0 ||
			!Array.isArray(decoded.upgrades)
		) { throw new Error() }
		points = decoded.points
		stats = {...base}
		const nextStats = { ...base }
		const nextCounts = {}
		for (let u of upgrades) {
			const savedUp = decoded.upgrades.find(up => up.id === u.id)
			const count = Number(savedUp?.count)
			if (!Number.isFinite(count)) throw new TypeError("Invalid upgrade count!")
			nextCounts[u.id] = Math.max(0, Math.min(u.max, Math.floor(count)))
		}
		upgrades.forEach(u => {
			let decodedUp = decoded.upgrades.find(up => up.id === u.id)
			let saved = Number(decodedUp?.count)
			if (!Number.isFinite(savedCount)) saved = 0
			u.count = Math.max(0, Math.min(u.max, Math.floor(saved)))
			u.cost = Math.floor(u.bsc * (u.scale ** u.count))
			for (let i = 0; i < u.count; i++) applyBoosts(u.boosts)
		})
		reset()
		renderUpgrades()
		showPoints()
	} catch (e) {
		document.getElementById('save').value = "Invalid save string!"
		setTimeout(() => document.getElementById('save').value = "", 1000)
	}
}
document.getElementById("export").addEventListener("click", function() {
	document.getElementById('save').value = getSaveStr()
	document.getElementById('save').select()
})
document.getElementById("import").addEventListener("click", function() {
loadSaveStr(document.getElementById('save').value)
})
document.getElementById("hard-reset").addEventListener("click", function() {
let isConfirmed = confirm("Are you sure you want to reset your entire save?")
if (isConfirmed) {
	localStorage.removeItem(SAVE_KEY)
	location.reload()
}
})
