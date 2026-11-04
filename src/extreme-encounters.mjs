// DICEBOUND Extreme — 45 authored encounters from the original 15-quest chronicle.
export const EXTREME_ENCOUNTERS={
  "q13r1": {
    "name": "Cloudward Roads",
    "subtitle": "Sheltered causeway and the first predictable gust",
    "left": null,
    "right": "q13r2",
    "encounter": [
      16,
      16,
      16,
      16,
      18,
      18,
      18,
      18,
      20
    ],
    "foes": [
      {
        "faces": 16,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "ghost",
    "challenge": "A sheltered windward entry with a guarded crossfire · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 0
  },
  "q13r2": {
    "name": "The Skyward Approach",
    "subtitle": "Find cover before the wind",
    "left": "q13r1",
    "right": "q13r3",
    "encounter": [
      16,
      16,
      16,
      16,
      18,
      18,
      18,
      18,
      20,
      20
    ],
    "foes": [
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "healer"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "flanks",
    "challenge": "Move behind broken parapets before the gust · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 1
  },
  "q13r3": {
    "name": "Cloud Gate",
    "subtitle": "First trial guardian",
    "left": "q13r2",
    "right": "q13r4",
    "encounter": [
      26,
      18,
      18,
      18,
      20,
      20,
      20,
      20,
      22,
      22,
      22
    ],
    "foes": [
      {
        "faces": 26,
        "variant": "boss",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "armoured"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "centre",
    "challenge": "First storm guardian holds the narrow gate · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 2
  },
  "q13r4": {
    "name": "Hanging Gardens",
    "subtitle": "Exposed islands and stone shelters",
    "left": "q13r3",
    "right": "q13r5",
    "encounter": [
      18,
      18,
      18,
      18,
      20,
      20,
      20,
      20
    ],
    "foes": [
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "gate",
    "challenge": "Split garden paths force a decision between cover and speed · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 0
  },
  "q13r5": {
    "name": "The High Canopy",
    "subtitle": "Wind strengthens across the gardens",
    "left": "q13r4",
    "right": "q13r6",
    "encounter": [
      18,
      18,
      18,
      18,
      20,
      20,
      20,
      20,
      22
    ],
    "foes": [
      {
        "faces": 18,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "teleporter"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "rush",
    "challenge": "Fast attackers drive players out of the safer central grove · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 1
  },
  "q13r6": {
    "name": "Storm Bridge I",
    "subtitle": "Two-tile gusts and a major guardian",
    "left": "q13r5",
    "right": "q13r7",
    "encounter": [
      26,
      20,
      20,
      20,
      22,
      22,
      22,
      22,
      24,
      24
    ],
    "foes": [
      {
        "faces": 26,
        "variant": "boss",
        "role": "ninja"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "guard",
    "challenge": "The first storm bridge exposes two long gust corridors · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 2
  },
  "q13r7": {
    "name": "Storm Bridge II",
    "subtitle": "Narrow crossings above a real lower platform",
    "left": "q13r6",
    "right": "q13r8",
    "encounter": [
      20,
      20,
      20,
      20,
      22,
      22,
      22,
      22,
      24,
      24,
      24
    ],
    "foes": [
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ranged"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "shield",
    "challenge": "Alternating bridge walls create sheltered pockets · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 0
  },
  "q13r8": {
    "name": "The Hanging Crossing",
    "subtitle": "Dangerous wind across open spans",
    "left": "q13r7",
    "right": "q13r9",
    "encounter": [
      20,
      20,
      20,
      20,
      22,
      22,
      22,
      22
    ],
    "foes": [
      {
        "faces": 20,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ranged"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "boss",
    "challenge": "A hanging crossing combines archers and rotating wind lanes · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 1
  },
  "q13r9": {
    "name": "Thunder Tower I",
    "subtitle": "Ranged enemies control the causeway",
    "left": "q13r8",
    "right": "q13r10",
    "encounter": [
      22,
      22,
      22,
      22,
      24,
      24,
      24,
      24,
      26
    ],
    "foes": [
      {
        "faces": 22,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ninja"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "island",
    "challenge": "The first thunder tower: defeat protected healers · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 2
  },
  "q13r10": {
    "name": "Thunder Tower II",
    "subtitle": "An elite encounter in the wind",
    "left": "q13r9",
    "right": "q13r11",
    "encounter": [
      26,
      22,
      22,
      22,
      24,
      24,
      24,
      24,
      26,
      26
    ],
    "foes": [
      {
        "faces": 26,
        "variant": "boss",
        "role": "ninja"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "swift"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "stagger",
    "challenge": "Ninja storm sentries guard the tower stairs · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 0
  },
  "q13r11": {
    "name": "Citadel Perimeter",
    "subtitle": "Shelters are increasingly scarce",
    "left": "q13r10",
    "right": "q13r12",
    "encounter": [
      22,
      22,
      22,
      22,
      24,
      24,
      24,
      24,
      26,
      26,
      26
    ],
    "foes": [
      {
        "faces": 22,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "archers",
    "challenge": "The outer citadel has staggered barriers · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 1
  },
  "q13r12": {
    "name": "Citadel Walk",
    "subtitle": "Pushes threaten exposed heroes and enemies",
    "left": "q13r11",
    "right": "q13r13",
    "encounter": [
      24,
      24,
      24,
      24,
      26,
      26,
      26,
      26
    ],
    "foes": [
      {
        "faces": 24,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "ghost",
    "challenge": "A long ramp offers no straight safe firing line · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 2
  },
  "q13r13": {
    "name": "Citadel Summit",
    "subtitle": "Final approach to the Storm Throne",
    "left": "q13r12",
    "right": "q13r14",
    "encounter": [
      24,
      24,
      24,
      24,
      26,
      26,
      26,
      26,
      16
    ],
    "foes": [
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "healer"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "flanks",
    "challenge": "Shattered bridges create a sharp final ascent · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 0
  },
  "q13r14": {
    "name": "Eye of the Storm",
    "subtitle": "A perilous battle before the throne",
    "left": "q13r13",
    "right": "q13r15",
    "encounter": [
      24,
      24,
      24,
      24,
      26,
      26,
      26,
      26,
      16,
      16
    ],
    "foes": [
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "teleporter"
      }
    ],
    "quest": 13,
    "final": false,
    "stageTwo": false,
    "formation": "centre",
    "challenge": "Defenders guard the calm eye while the outside gusts · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 1
  },
  "q13r15": {
    "name": "Storm Throne",
    "subtitle": "The Sky Tyrant — Boss Ranged D30",
    "left": "q13r14",
    "right": null,
    "encounter": [
      30,
      26,
      26,
      26,
      16,
      16,
      16,
      16,
      18,
      18,
      18
    ],
    "foes": [
      {
        "faces": 30,
        "variant": "boss",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "swift"
      }
    ],
    "quest": 13,
    "final": true,
    "stageTwo": false,
    "formation": "gate",
    "challenge": "The Storm Tyrant commands the last open-air throne · 🌪 Gust every third enemy phase.",
    "hazard": "storm",
    "hazardPhaseOffset": 2
  },
  "q14r1": {
    "name": "The Forgotten Entrance",
    "subtitle": "Approach and light the first ancient lantern",
    "left": null,
    "right": "q14r2",
    "encounter": [
      18,
      18,
      18,
      18,
      20,
      20,
      20,
      20,
      22
    ],
    "foes": [
      {
        "faces": 18,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "stagger",
    "challenge": "A single lantern gives one safe pocket of light · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 0
  },
  "q14r2": {
    "name": "The Buried Streets",
    "subtitle": "Enemies wait beyond the hero’s three-tile light",
    "left": "q14r1",
    "right": "q14r3",
    "encounter": [
      18,
      18,
      18,
      18,
      20,
      20,
      20,
      20,
      22,
      22
    ],
    "foes": [
      {
        "faces": 18,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "healer"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "archers",
    "challenge": "Long streets divide the party across dark alleys · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 1
  },
  "q14r3": {
    "name": "The Crystal Gardens",
    "subtitle": "Natural glowing crystals provide safe pools",
    "left": "q14r2",
    "right": "q14r4",
    "encounter": [
      20,
      20,
      20,
      20,
      22,
      22,
      22,
      22,
      24,
      24,
      24
    ],
    "foes": [
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "teleporter"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "ghost",
    "challenge": "Crystals illuminate islands between the ruins · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 2
  },
  "q14r4": {
    "name": "The Abandoned Market",
    "subtitle": "Hidden treasure amongst dark stalls",
    "left": "q14r3",
    "right": "q14r5",
    "encounter": [
      20,
      20,
      20,
      20,
      22,
      22,
      22,
      22
    ],
    "foes": [
      {
        "faces": 20,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ghost"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "flanks",
    "challenge": "Hidden market stalls conceal mobile shadows · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 0
  },
  "q14r5": {
    "name": "The Hall of Lanterns",
    "subtitle": "Light the room while defending yourself",
    "left": "q14r4",
    "right": "q14r6",
    "encounter": [
      20,
      20,
      20,
      20,
      22,
      22,
      22,
      22,
      24
    ],
    "foes": [
      {
        "faces": 20,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "zombie"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "centre",
    "challenge": "Reach lanterns defended by hard-hitting sentries · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 1
  },
  "q14r6": {
    "name": "The Deep Stairway",
    "subtitle": "The long descent into growing darkness",
    "left": "q14r5",
    "right": "q14r7",
    "encounter": [
      22,
      22,
      22,
      22,
      24,
      24,
      24,
      24,
      26,
      26
    ],
    "foes": [
      {
        "faces": 22,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "gate",
    "challenge": "Staggered staircases lead away from the safe beacons · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 2
  },
  "q14r7": {
    "name": "The Silent Library",
    "subtitle": "Ghosts slip through the stacks",
    "left": "q14r6",
    "right": "q14r8",
    "encounter": [
      22,
      22,
      22,
      22,
      24,
      24,
      24,
      24,
      26,
      26,
      26
    ],
    "foes": [
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "rush",
    "challenge": "Ghosts phase through bookshelves into the darkness · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 0
  },
  "q14r8": {
    "name": "The Broken Observatory",
    "subtitle": "Teleporters exploit unlit passages",
    "left": "q14r7",
    "right": "q14r9",
    "encounter": [
      22,
      22,
      22,
      22,
      24,
      24,
      24,
      24
    ],
    "foes": [
      {
        "faces": 22,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ghost"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "guard",
    "challenge": "Teleporters strike from beyond the lantern glow · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 1
  },
  "q14r9": {
    "name": "The Forgotten Barracks",
    "subtitle": "Armoured guards hold the lanterns",
    "left": "q14r8",
    "right": "q14r10",
    "encounter": [
      24,
      24,
      24,
      24,
      26,
      26,
      26,
      26,
      16
    ],
    "foes": [
      {
        "faces": 24,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "shield",
    "challenge": "Heavy guards pin players beyond the light pool · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 2
  },
  "q14r10": {
    "name": "The Underground Lake",
    "subtitle": "Scattered islands of natural light",
    "left": "q14r9",
    "right": "q14r11",
    "encounter": [
      24,
      24,
      24,
      24,
      26,
      26,
      26,
      26,
      16,
      16
    ],
    "foes": [
      {
        "faces": 24,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ninja"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "boss",
    "challenge": "Separated light islands cut across flooded passages · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 0
  },
  "q14r11": {
    "name": "The Shadow Palace",
    "subtitle": "Ninjas disappear into the gloom",
    "left": "q14r10",
    "right": "q14r12",
    "encounter": [
      24,
      24,
      24,
      24,
      26,
      26,
      26,
      26,
      16,
      16,
      16
    ],
    "foes": [
      {
        "faces": 24,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "cloner"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "island",
    "challenge": "Ninjas use dark court passages to flank · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 1
  },
  "q14r12": {
    "name": "The Chamber of Echoes",
    "subtitle": "Cloners multiply outside illuminated areas",
    "left": "q14r11",
    "right": "q14r13",
    "encounter": [
      26,
      26,
      26,
      26,
      16,
      16,
      16,
      16
    ],
    "foes": [
      {
        "faces": 26,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "teleporter"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "stagger",
    "challenge": "Cloners build a multiplying army in the shadows · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 2
  },
  "q14r13": {
    "name": "The Black Treasury",
    "subtitle": "Valuable hidden loot and defenders",
    "left": "q14r12",
    "right": "q14r14",
    "encounter": [
      26,
      26,
      26,
      26,
      16,
      16,
      16,
      16,
      18
    ],
    "foes": [
      {
        "faces": 26,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "healer"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "archers",
    "challenge": "The treasury has precious loot and few safe tiles · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 0
  },
  "q14r14": {
    "name": "The Descent of Kings",
    "subtitle": "Few lights on the final descent",
    "left": "q14r13",
    "right": "q14r15",
    "encounter": [
      26,
      26,
      26,
      26,
      16,
      16,
      16,
      16,
      18,
      18
    ],
    "foes": [
      {
        "faces": 26,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "zombie"
      }
    ],
    "quest": 14,
    "final": false,
    "stageTwo": false,
    "formation": "ghost",
    "challenge": "The final stair narrows toward the pitch-black heart · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 1
  },
  "q14r15": {
    "name": "The Heart of Fortune",
    "subtitle": "The Shadow Guardian — Boss Ghost D30",
    "left": "q14r14",
    "right": null,
    "encounter": [
      30,
      16,
      16,
      16,
      18,
      18,
      18,
      18,
      20,
      20,
      20
    ],
    "foes": [
      {
        "faces": 30,
        "variant": "boss",
        "role": "ghost"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ghost"
      }
    ],
    "quest": 14,
    "final": true,
    "stageTwo": false,
    "formation": "flanks",
    "challenge": "Shadow Guardian D30 defends the deepest lantern · 🏮 Stay near lantern light.",
    "hazard": "darkness",
    "hazardPhaseOffset": 2
  },
  "q15r1": {
    "name": "The Traveller’s Gate",
    "subtitle": "Trial 1 • control the crossings",
    "left": null,
    "right": "q15r2",
    "encounter": [
      22,
      22,
      22,
      22,
      24,
      24,
      24,
      24,
      26,
      26
    ],
    "foes": [
      {
        "faces": 22,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ninja"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "boss",
    "challenge": "Movement trial: control three converging approaches · 👑 Trial 1.",
    "hazard": null,
    "hazardPhaseOffset": 0
  },
  "q15r2": {
    "name": "Steps of Fortune",
    "subtitle": "Trial 1 • obstacles and positioning",
    "left": "q15r1",
    "right": "q15r3",
    "encounter": [
      22,
      22,
      22,
      22,
      24,
      24,
      24,
      24,
      26,
      26,
      26
    ],
    "foes": [
      {
        "faces": 22,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "island",
    "challenge": "Movement trial: turn the corners to escape archers · 👑 Trial 1.",
    "hazard": null,
    "hazardPhaseOffset": 1
  },
  "q15r3": {
    "name": "The Moving Court",
    "subtitle": "Trial 1 • movement guardian",
    "left": "q15r2",
    "right": "q15r4",
    "encounter": [
      28,
      24,
      24,
      24,
      26,
      26,
      26,
      26,
      28,
      28,
      28,
      28
    ],
    "foes": [
      {
        "faces": 28,
        "variant": "boss",
        "role": "armoured"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "ninja"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "stagger",
    "challenge": "Movement guardian tests dodging and counterattacks · 👑 Trial 1.",
    "hazard": null,
    "hazardPhaseOffset": 2
  },
  "q15r4": {
    "name": "Chamber of Resolve",
    "subtitle": "Trial 2 • endurance under attack",
    "left": "q15r3",
    "right": "q15r5",
    "encounter": [
      24,
      24,
      24,
      24,
      26,
      26,
      26,
      26,
      28
    ],
    "foes": [
      {
        "faces": 24,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "swift"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "archers",
    "challenge": "Endurance trial: armoured attackers arrive from both sides · 👑 Trial 2.",
    "hazard": null,
    "hazardPhaseOffset": 0
  },
  "q15r5": {
    "name": "The Long Watch",
    "subtitle": "Trial 2 • sustained combat",
    "left": "q15r4",
    "right": "q15r6",
    "encounter": [
      24,
      24,
      24,
      24,
      26,
      26,
      26,
      26,
      28,
      28
    ],
    "foes": [
      {
        "faces": 24,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "ghost"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "ghost",
    "challenge": "Endurance trial: support enemies draw out the fight · 👑 Trial 2.",
    "hazard": null,
    "hazardPhaseOffset": 1
  },
  "q15r6": {
    "name": "The Iron Vigil",
    "subtitle": "Trial 2 • endurance guardian",
    "left": "q15r5",
    "right": "q15r7",
    "encounter": [
      28,
      26,
      26,
      26,
      28,
      28,
      28,
      28,
      18,
      18,
      18
    ],
    "foes": [
      {
        "faces": 28,
        "variant": "boss",
        "role": "ninja"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "flanks",
    "challenge": "Iron Vigil guardian blocks the centre · 👑 Trial 2.",
    "hazard": null,
    "hazardPhaseOffset": 2
  },
  "q15r7": {
    "name": "The Legion Hall",
    "subtitle": "Trial 3 • coordinated formations",
    "left": "q15r6",
    "right": "q15r8",
    "encounter": [
      26,
      26,
      26,
      26,
      28,
      28,
      28,
      28,
      18,
      18,
      18,
      18
    ],
    "foes": [
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ghost"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "centre",
    "challenge": "Formation trial: a mixed legion holds flanking posts · 👑 Trial 3.",
    "hazard": null,
    "hazardPhaseOffset": 0
  },
  "q15r8": {
    "name": "The Royal Arsenal",
    "subtitle": "Trial 3 • break enemy support",
    "left": "q15r7",
    "right": "q15r9",
    "encounter": [
      26,
      26,
      26,
      26,
      28,
      28,
      28,
      28,
      18
    ],
    "foes": [
      {
        "faces": 26,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 26,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "gate",
    "challenge": "Formation trial: eliminate healers behind armour · 👑 Trial 3.",
    "hazard": null,
    "hazardPhaseOffset": 1
  },
  "q15r9": {
    "name": "The General’s Stand",
    "subtitle": "Trial 3 • legion guardian",
    "left": "q15r8",
    "right": "q15r10",
    "encounter": [
      28,
      28,
      28,
      28,
      18,
      18,
      18,
      18,
      20,
      20
    ],
    "foes": [
      {
        "faces": 28,
        "variant": "boss",
        "role": "armoured"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "zombie"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "rush",
    "challenge": "Legion general guards the arena · 👑 Trial 3.",
    "hazard": null,
    "hazardPhaseOffset": 2
  },
  "q15r10": {
    "name": "The Impossible Gallery",
    "subtitle": "Trial 4 • ghosts and teleporters",
    "left": "q15r9",
    "right": "q15r11",
    "encounter": [
      28,
      28,
      28,
      28,
      18,
      18,
      18,
      18,
      20,
      20,
      20
    ],
    "foes": [
      {
        "faces": 28,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "healer"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "guard",
    "challenge": "Impossible trial: ghosts ignore stone walls · 👑 Trial 4.",
    "hazard": null,
    "hazardPhaseOffset": 0
  },
  "q15r11": {
    "name": "The Hall of Returning",
    "subtitle": "Trial 4 • zombies and cloners",
    "left": "q15r10",
    "right": "q15r12",
    "encounter": [
      28,
      28,
      28,
      28,
      18,
      18,
      18,
      18,
      20,
      20,
      20,
      20
    ],
    "foes": [
      {
        "faces": 28,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 28,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "zombie"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "shield",
    "challenge": "Impossible trial: zombies rise and cloners multiply · 👑 Trial 4.",
    "hazard": null,
    "hazardPhaseOffset": 1
  },
  "q15r12": {
    "name": "The Paradox Vault",
    "subtitle": "Trial 4 • impossible guardian",
    "left": "q15r11",
    "right": "q15r13",
    "encounter": [
      28,
      18,
      18,
      18,
      20,
      20,
      20,
      20,
      22
    ],
    "foes": [
      {
        "faces": 28,
        "variant": "boss",
        "role": "ninja"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "boss",
    "challenge": "Paradox guardian changes combat roles · 👑 Trial 4.",
    "hazard": null,
    "hazardPhaseOffset": 2
  },
  "q15r13": {
    "name": "The Crown Approach",
    "subtitle": "Trial 5 • elite royal defenders",
    "left": "q15r12",
    "right": "q15r14",
    "encounter": [
      18,
      18,
      18,
      18,
      20,
      20,
      20,
      20,
      22,
      22
    ],
    "foes": [
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "swift"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "island",
    "challenge": "Royal defenders coordinate all specialist attacks · 👑 Trial 5.",
    "hazard": null,
    "hazardPhaseOffset": 0
  },
  "q15r14": {
    "name": "The Throne Antechamber",
    "subtitle": "Trial 5 • last royal guardians",
    "left": "q15r13",
    "right": "q15r15",
    "encounter": [
      18,
      18,
      18,
      18,
      20,
      20,
      20,
      20,
      22,
      22,
      22
    ],
    "foes": [
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "teleporter"
      }
    ],
    "quest": 15,
    "final": false,
    "stageTwo": false,
    "formation": "stagger",
    "challenge": "The last antechamber demands careful positioning · 👑 Trial 5.",
    "hazard": null,
    "hazardPhaseOffset": 1
  },
  "q15r15": {
    "name": "The Final Throne",
    "subtitle": "Trial 5 • the Dice King, three faces, one health bar",
    "left": "q15r14",
    "right": null,
    "encounter": [
      30,
      20,
      20,
      20,
      22,
      22,
      22,
      22,
      24,
      24,
      24,
      24
    ],
    "foes": [
      {
        "faces": 30,
        "variant": "boss",
        "role": "armoured"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "swift"
      }
    ],
    "quest": 15,
    "final": true,
    "stageTwo": false,
    "formation": "archers",
    "challenge": "The Dice King has three changing faces and one health bar · 👑 Trial 5.",
    "hazard": null,
    "hazardPhaseOffset": 2
  }
};
