// DICEBOUND 4.0 — authored Hard encounter rosters, original quest texts and room tactics.
export const HARD_ENCOUNTERS={
  "q10r1": {
    "name": "Broken Gateway",
    "subtitle": "The first unpredictable surge",
    "left": null,
    "right": "q10r2",
    "encounter": [
      12,
      14,
      16,
      12,
      14,
      16,
      12
    ],
    "foes": [
      {
        "faces": 12,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 12,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 12,
        "variant": "normal",
        "role": "ninja"
      }
    ],
    "quest": 10,
    "final": false,
    "stageTwo": false,
    "formation": "gate",
    "challenge": "The gateway forks: eliminate two Ranged sentries before they box in the approach. ⚡ Marked energy tiles surge every third enemy phase.",
    "hazard": "chaos",
    "hazardPhaseOffset": 0
  },
  "q10r2": {
    "name": "Floating Steps",
    "subtitle": "Space itself shifts",
    "left": "q10r1",
    "right": "q10r3",
    "encounter": [
      12,
      14,
      16,
      12,
      14,
      16,
      12
    ],
    "foes": [
      {
        "faces": 12,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 12,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 12,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 10,
    "final": false,
    "stageTwo": false,
    "formation": "island",
    "challenge": "Displaced platforms split Teleporters from the back-line archers. ⚡ Marked energy tiles surge every third enemy phase.",
    "hazard": "chaos",
    "hazardPhaseOffset": 1
  },
  "q10r3": {
    "name": "Shifting Hall",
    "subtitle": "Obstacles refuse to stay put",
    "left": "q10r2",
    "right": "q10r4",
    "encounter": [
      12,
      14,
      16,
      12,
      14,
      16,
      12
    ],
    "foes": [
      {
        "faces": 12,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 12,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 12,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 10,
    "final": false,
    "stageTwo": false,
    "formation": "flanks",
    "challenge": "Armoured anchors defend the two narrow stable crossings. ⚡ Marked energy tiles surge every third enemy phase.",
    "hazard": "chaos",
    "hazardPhaseOffset": 2
  },
  "q10r4": {
    "name": "Fractured Garden",
    "subtitle": "Swift and Teleporter dice",
    "left": "q10r3",
    "right": "q10r5",
    "encounter": [
      14,
      16,
      18,
      14,
      16,
      18,
      14
    ],
    "foes": [
      {
        "faces": 14,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 10,
    "final": false,
    "stageTwo": false,
    "formation": "rush",
    "challenge": "Fast dice close from the garden's three fractured entrances. ⚡ Marked energy tiles surge every third enemy phase.",
    "hazard": "chaos",
    "hazardPhaseOffset": 0
  },
  "q10r5": {
    "name": "Mirror Chamber",
    "subtitle": "The realm remakes its occupants",
    "left": "q10r4",
    "right": "q10r6",
    "encounter": [
      14,
      16,
      18,
      14,
      16,
      18,
      14
    ],
    "foes": [
      {
        "faces": 14,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "ranged"
      }
    ],
    "quest": 10,
    "final": false,
    "stageTwo": false,
    "formation": "ghost",
    "challenge": "Cloners multiply behind a mirrored partition—reach the originals. ⚡ Marked energy tiles surge every third enemy phase.",
    "hazard": "chaos",
    "hazardPhaseOffset": 1
  },
  "q10r6": {
    "name": "Upside-Down Tower",
    "subtitle": "Armoured and Ranged foes",
    "left": "q10r5",
    "right": "q10r7",
    "encounter": [
      14,
      16,
      18,
      14,
      16,
      18,
      14
    ],
    "foes": [
      {
        "faces": 14,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 10,
    "final": false,
    "stageTwo": false,
    "formation": "shield",
    "challenge": "An iron ring shelters paired Ranged enemies across the central tower. ⚡ Marked energy tiles surge every third enemy phase.",
    "hazard": "chaos",
    "hazardPhaseOffset": 2
  },
  "q10r7": {
    "name": "Impossible Bridge",
    "subtitle": "Risky lightning and regrouping",
    "left": "q10r6",
    "right": "q10r8",
    "encounter": [
      16,
      18,
      20,
      16,
      18,
      20,
      16
    ],
    "foes": [
      {
        "faces": 16,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 10,
    "final": false,
    "stageTwo": false,
    "formation": "island",
    "challenge": "The bridge has very little safe terrain during the next energy surge. ⚡ Marked energy tiles surge every third enemy phase.",
    "hazard": "chaos",
    "hazardPhaseOffset": 0
  },
  "q10r8": {
    "name": "Storm Gallery",
    "subtitle": "Magic armour and chaotic movement",
    "left": "q10r7",
    "right": "q10r9",
    "encounter": [
      16,
      18,
      20,
      16,
      18,
      20,
      16
    ],
    "foes": [
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ninja"
      }
    ],
    "quest": 10,
    "final": false,
    "stageTwo": false,
    "formation": "archers",
    "challenge": "Separated artillery lanes force a choice of which flank to clear first. ⚡ Marked energy tiles surge every third enemy phase.",
    "hazard": "chaos",
    "hazardPhaseOffset": 1
  },
  "q10r9": {
    "name": "Heart of Chaos",
    "subtitle": "The last defenders",
    "left": "q10r8",
    "right": "q10r10",
    "encounter": [
      16,
      18,
      20,
      16,
      18,
      20,
      16,
      18
    ],
    "foes": [
      {
        "faces": 16,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 10,
    "final": false,
    "stageTwo": false,
    "formation": "centre",
    "challenge": "A healer keeps the last defenders standing as space folds across the centre. ⚡ Marked energy tiles surge every third enemy phase.",
    "hazard": "chaos",
    "hazardPhaseOffset": 2
  },
  "q10r10": {
    "name": "Chaos Throne",
    "subtitle": "Boss D20 Chaos King, changing behaviour",
    "left": "q10r9",
    "right": null,
    "encounter": [
      20,
      20,
      22,
      18,
      20,
      22,
      18,
      20
    ],
    "foes": [
      {
        "faces": 20,
        "variant": "boss",
        "role": "teleporter"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "cloner"
      },
      {
        "faces": 22,
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
        "role": "ghost"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      }
    ],
    "quest": 10,
    "final": true,
    "stageTwo": false,
    "formation": "boss",
    "challenge": "The Chaos King rotates between Teleporter, Armoured and Ghost forms every enemy phase. ⚡ Marked energy tiles surge every third enemy phase.",
    "hazard": "chaos",
    "hazardPhaseOffset": 0
  },
  "q11r1": {
    "name": "Exposed Harbour",
    "subtitle": "Learn the tide cycle",
    "left": null,
    "right": "q11r2",
    "encounter": [
      14,
      16,
      18,
      14,
      16,
      18,
      14
    ],
    "foes": [
      {
        "faces": 14,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 11,
    "final": false,
    "stageTwo": false,
    "formation": "flanks",
    "challenge": "Tidal tiles fill in a predictable three-phase cycle; learn the safe shore route. 🌊 Marked flood tiles rise for two phases in three.",
    "hazard": "tide",
    "hazardPhaseOffset": 0
  },
  "q11r2": {
    "name": "Flooded Market",
    "subtitle": "Raised stalls and low passages",
    "left": "q11r1",
    "right": "q11r3",
    "encounter": [
      14,
      16,
      18,
      14,
      16,
      18,
      14
    ],
    "foes": [
      {
        "faces": 14,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "swift"
      }
    ],
    "quest": 11,
    "final": false,
    "stageTwo": false,
    "formation": "island",
    "challenge": "Dry stalls offer cover but the flooded centre is the shortest route. 🌊 Marked flood tiles rise for two phases in three.",
    "hazard": "tide",
    "hazardPhaseOffset": 1
  },
  "q11r3": {
    "name": "Broken Aqueduct",
    "subtitle": "Timed crossings",
    "left": "q11r2",
    "right": "q11r4",
    "encounter": [
      14,
      16,
      18,
      14,
      16,
      18,
      14
    ],
    "foes": [
      {
        "faces": 14,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 14,
        "variant": "normal",
        "role": "ranged"
      }
    ],
    "quest": 11,
    "final": false,
    "stageTwo": false,
    "formation": "gate",
    "challenge": "The broken watercourse separates Ranged foes from Swift pursuers. 🌊 Marked flood tiles rise for two phases in three.",
    "hazard": "tide",
    "hazardPhaseOffset": 2
  },
  "q11r4": {
    "name": "Sunken Gardens",
    "subtitle": "Ghosts and submerged routes",
    "left": "q11r3",
    "right": "q11r5",
    "encounter": [
      16,
      18,
      20,
      16,
      18,
      20,
      16
    ],
    "foes": [
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
        "faces": 20,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "healer"
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
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 11,
    "final": false,
    "stageTwo": false,
    "formation": "ghost",
    "challenge": "Ghosts cross drowned walls while zombies hold the raised steps. 🌊 Marked flood tiles rise for two phases in three.",
    "hazard": "tide",
    "hazardPhaseOffset": 0
  },
  "q11r5": {
    "name": "Royal Causeway",
    "subtitle": "A safe bridge across the flood",
    "left": "q11r4",
    "right": "q11r6",
    "encounter": [
      16,
      18,
      20,
      16,
      18,
      20,
      16
    ],
    "foes": [
      {
        "faces": 16,
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
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 11,
    "final": false,
    "stageTwo": false,
    "formation": "shield",
    "challenge": "A long safe causeway is covered by two Ranged defenders. 🌊 Marked flood tiles rise for two phases in three.",
    "hazard": "tide",
    "hazardPhaseOffset": 1
  },
  "q11r6": {
    "name": "Drowned Barracks",
    "subtitle": "Defenders use the high ground",
    "left": "q11r5",
    "right": "q11r7",
    "encounter": [
      16,
      18,
      20,
      16,
      18,
      20,
      16,
      18
    ],
    "foes": [
      {
        "faces": 16,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "zombie"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 11,
    "final": false,
    "stageTwo": false,
    "formation": "archers",
    "challenge": "Healers hide behind the armoured guard in the ruined barracks. 🌊 Marked flood tiles rise for two phases in three.",
    "hazard": "tide",
    "hazardPhaseOffset": 2
  },
  "q11r7": {
    "name": "Collapsed Cathedral",
    "subtitle": "Water rises amongst fallen columns",
    "left": "q11r6",
    "right": "q11r8",
    "encounter": [
      18,
      20,
      22,
      18,
      20,
      22,
      18
    ],
    "foes": [
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
        "faces": 22,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 11,
    "final": false,
    "stageTwo": false,
    "formation": "island",
    "challenge": "Columns break sightlines, while flood tiles punish stationary attacks. 🌊 Marked flood tiles rise for two phases in three.",
    "hazard": "tide",
    "hazardPhaseOffset": 0
  },
  "q11r8": {
    "name": "Treasury Approach",
    "subtitle": "Tactical openings and dry ground",
    "left": "q11r7",
    "right": "q11r9",
    "encounter": [
      18,
      20,
      22,
      18,
      20,
      22,
      18,
      20
    ],
    "foes": [
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "healer"
      }
    ],
    "quest": 11,
    "final": false,
    "stageTwo": false,
    "formation": "guard",
    "challenge": "Archers cover the Treasury approach from opposite dry alcoves. 🌊 Marked flood tiles rise for two phases in three.",
    "hazard": "tide",
    "hazardPhaseOffset": 1
  },
  "q11r9": {
    "name": "Submerged Vault",
    "subtitle": "The last flooded defences",
    "left": "q11r8",
    "right": "q11r10",
    "encounter": [
      18,
      20,
      22,
      18,
      20,
      22,
      18,
      20
    ],
    "foes": [
      {
        "faces": 18,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 22,
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
        "role": "ninja"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 11,
    "final": false,
    "stageTwo": false,
    "formation": "centre",
    "challenge": "Ninjas guard dry islands while Ghosts cross the submerged vault. 🌊 Marked flood tiles rise for two phases in three.",
    "hazard": "tide",
    "hazardPhaseOffset": 2
  },
  "q11r10": {
    "name": "Drowned Throne",
    "subtitle": "Boss Ninja D24, the Tide Sovereign",
    "left": "q11r9",
    "right": null,
    "encounter": [
      24,
      22,
      24,
      20,
      22,
      24,
      20,
      22
    ],
    "foes": [
      {
        "faces": 24,
        "variant": "boss",
        "role": "ninja"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 20,
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
        "role": "zombie"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "swift"
      }
    ],
    "quest": 11,
    "final": true,
    "stageTwo": false,
    "formation": "boss",
    "challenge": "The Tide Sovereign fights among alternating flooded lanes and guarded pillars. 🌊 Marked flood tiles rise for two phases in three.",
    "hazard": "tide",
    "hazardPhaseOffset": 0
  },
  "q12r1": {
    "name": "Breached Gates",
    "subtitle": "Enter the occupied city",
    "left": null,
    "right": "q12r2",
    "encounter": [
      16,
      18,
      20,
      16,
      18,
      20,
      16
    ],
    "foes": [
      {
        "faces": 16,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 16,
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
        "role": "ranged"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 12,
    "final": false,
    "stageTwo": false,
    "formation": "gate",
    "challenge": "Breached gates create a defensive V; defeat the gate archers to advance.",
    "hazard": null,
    "hazardPhaseOffset": 0
  },
  "q12r2": {
    "name": "Market Square",
    "subtitle": "Capture the Market banner for discounts",
    "left": "q12r1",
    "right": "q12r3",
    "encounter": [
      16,
      18,
      20,
      16,
      18,
      20,
      16
    ],
    "foes": [
      {
        "faces": 16,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 12,
    "final": false,
    "stageTwo": false,
    "formation": "centre",
    "challenge": "Take the Market Square: securing it unlocks a permanent 10% shop discount.",
    "hazard": null,
    "hazardPhaseOffset": 1
  },
  "q12r3": {
    "name": "Merchant Warehouses",
    "subtitle": "Capture Warehouse supplies",
    "left": "q12r2",
    "right": "q12r4",
    "encounter": [
      16,
      18,
      20,
      16,
      18,
      20,
      16
    ],
    "foes": [
      {
        "faces": 16,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
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
        "role": "normal"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 16,
        "variant": "normal",
        "role": "healer"
      }
    ],
    "quest": 12,
    "final": false,
    "stageTwo": false,
    "formation": "archers",
    "challenge": "Clear Warehouse defenders to claim a one-time supply of 65 gold per player present.",
    "hazard": null,
    "hazardPhaseOffset": 2
  },
  "q12r4": {
    "name": "Temple Gardens",
    "subtitle": "Capture the Temple for healing",
    "left": "q12r3",
    "right": "q12r5",
    "encounter": [
      18,
      20,
      22,
      18,
      20,
      22,
      18
    ],
    "foes": [
      {
        "faces": 18,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      }
    ],
    "quest": 12,
    "final": false,
    "stageTwo": false,
    "formation": "ghost",
    "challenge": "Protect your healer: capturing the Temple restores 25% maximum HP to survivors here.",
    "hazard": null,
    "hazardPhaseOffset": 0
  },
  "q12r5": {
    "name": "Occupied Barracks",
    "subtitle": "Capture the Barracks to thin the defenders",
    "left": "q12r4",
    "right": "q12r6",
    "encounter": [
      18,
      20,
      22,
      18,
      20,
      22,
      18,
      20
    ],
    "foes": [
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
        "faces": 22,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 12,
    "final": false,
    "stageTwo": false,
    "formation": "shield",
    "challenge": "An armoured garrison shelters Ranged defenders in the barracks' northern wing.",
    "hazard": null,
    "hazardPhaseOffset": 1
  },
  "q12r6": {
    "name": "Western Streets",
    "subtitle": "Choose which districts to liberate",
    "left": "q12r5",
    "right": "q12r7",
    "encounter": [
      18,
      20,
      22,
      18,
      20,
      22,
      18
    ],
    "foes": [
      {
        "faces": 18,
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
        "faces": 18,
        "variant": "normal",
        "role": "teleporter"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 18,
        "variant": "normal",
        "role": "armoured"
      }
    ],
    "quest": 12,
    "final": false,
    "stageTwo": false,
    "formation": "flanks",
    "challenge": "Swift patrols converge from two streets; use the crossroads to split them.",
    "hazard": null,
    "hazardPhaseOffset": 2
  },
  "q12r7": {
    "name": "Siege Lines",
    "subtitle": "Push through royal defences",
    "left": "q12r6",
    "right": "q12r8",
    "encounter": [
      20,
      22,
      24,
      20,
      22,
      24,
      20,
      22
    ],
    "foes": [
      {
        "faces": 20,
        "variant": "normal",
        "role": "ranged"
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
        "faces": 20,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 24,
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
        "role": "normal"
      }
    ],
    "quest": 12,
    "final": false,
    "stageTwo": false,
    "formation": "archers",
    "challenge": "Siege archers and plate-armoured guards occupy interlocking firing positions.",
    "hazard": null,
    "hazardPhaseOffset": 0
  },
  "q12r8": {
    "name": "Royal Approach",
    "subtitle": "Prepare the liberation",
    "left": "q12r7",
    "right": "q12r9",
    "encounter": [
      20,
      22,
      24,
      20,
      22,
      24,
      20,
      22
    ],
    "foes": [
      {
        "faces": 20,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "armoured"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ranged"
      },
      {
        "faces": 20,
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
        "role": "swift"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 12,
    "final": false,
    "stageTwo": false,
    "formation": "guard",
    "challenge": "The Royal Approach funnels attacks toward the centre; flank the healers.",
    "hazard": null,
    "hazardPhaseOffset": 1
  },
  "q12r9": {
    "name": "Castle Courtyard",
    "subtitle": "Capture Castle and hold two more districts",
    "left": "q12r8",
    "right": "q12r10",
    "encounter": [
      20,
      22,
      24,
      20,
      22,
      24,
      20,
      22
    ],
    "foes": [
      {
        "faces": 20,
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
        "role": "ranged"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "healer"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "swift"
      },
      {
        "faces": 20,
        "variant": "normal",
        "role": "normal"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "normal"
      }
    ],
    "quest": 12,
    "final": false,
    "stageTwo": false,
    "formation": "gate",
    "challenge": "The Castle Courtyard has two defensive pockets and one hard-fought breach.",
    "hazard": null,
    "hazardPhaseOffset": 2
  },
  "q12r10": {
    "name": "Throne Hall",
    "subtitle": "Boss Group Healer D24 — the False King",
    "left": "q12r9",
    "right": null,
    "encounter": [
      24,
      24,
      26,
      22,
      24,
      26,
      22,
      24
    ],
    "foes": [
      {
        "faces": 24,
        "variant": "boss",
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
        "role": "ranged"
      },
      {
        "faces": 22,
        "variant": "normal",
        "role": "ninja"
      },
      {
        "faces": 24,
        "variant": "normal",
        "role": "ghost"
      },
      {
        "faces": 26,
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
        "role": "normal"
      }
    ],
    "quest": 12,
    "final": true,
    "stageTwo": false,
    "formation": "boss",
    "challenge": "The False King heals supporters; separate him from his armoured retinue.",
    "hazard": null,
    "hazardPhaseOffset": 0
  }
};
