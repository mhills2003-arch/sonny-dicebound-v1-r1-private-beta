import {PLAYABLE_QUESTS} from './campaign.mjs';
import {QUEST_TIERS,normalizedCompletions,unlockedQuestCeiling,questIsUnlocked,migrateLegacyCompletions} from './quest-progression.mjs';
import {HARD_ENCOUNTERS} from './hard-encounters.mjs';
import {HARD_BLUEPRINTS} from './hard-rooms.mjs';
import {EXTREME_ENCOUNTERS} from './extreme-encounters.mjs';
import {EXTREME_BLUEPRINTS,ABYSS_LANTERNS} from './extreme-rooms.mjs';
import {ROOM_BLUEPRINTS,ROOM_CHALLENGES,MEDIUM_BRIDGE_BLUEPRINTS,MEDIUM_BRIDGE_CHALLENGES} from './level-designs.mjs';
/** DICEBOUND 4.0 co-op campaign beta: Quests 1–15 of 15.
 * Deterministic rules module. Original Quest 1 names, DICE HP = faces, classes,
 * free room exploration, shared room-specific tactical turns and 60s clock.
 * This is an independent multiplayer prototype, not the whole 3.2 engine port.
 */
export const ROOM_DATA = {
  "woodland": {
    "name": "Woodland Path",
    "subtitle": "Quiet woodland trail · safe exploration and hidden finds",
    "left": null,
    "right": "clearing",
    "encounter": [],
    "foes": [],
    "quest": 1,
    "final": false,
    "stageTwo": false
  },
  "clearing": {
    "name": "Training Clearing",
    "subtitle": "Two ordinary dice · learn combat in the open woods",
    "left": "woodland",
    "right": "watchpost",
    "encounter": [
      6,
      6
    ],
    "foes": [
      {
        "faces": 6,
        "variant": "normal"
      },
      {
        "faces": 6,
        "variant": "normal"
      }
    ],
    "quest": 1,
    "final": false,
    "stageTwo": false
  },
  "watchpost": {
    "name": "Old Watchpost",
    "subtitle": "A merchant before the D8 guardian",
    "left": "clearing",
    "right": null,
    "encounter": [
      8
    ],
    "foes": [
      {
        "faces": 8,
        "variant": "boss"
      }
    ],
    "quest": 1,
    "final": true,
    "stageTwo": false
  },
  "q2r1": {
    "name": "Abandoned Mine",
    "subtitle": "Two ordinary dice guard the crystal mine entrance",
    "left": null,
    "right": "q2r2",
    "encounter": [4,6],
    "foes": [{"faces":4,"variant":"normal"},{"faces":6,"variant":"normal"}],
    "quest": 2,
    "final": false,
    "stageTwo": false
  },
  "q2r2": {
    "name": "Crystal Hollow",
    "subtitle": "Meet the first Shiny D4",
    "left": "q2r1",
    "right": "q2r3",
    "encounter": [
      4
    ],
    "foes": [
      {
        "faces": 4,
        "variant": "shiny"
      }
    ],
    "quest": 2,
    "final": false,
    "stageTwo": false
  },
  "q2r3": {
    "name": "Glittering Gallery",
    "subtitle": "Ordinary foes and a Shiny D6",
    "left": "q2r2",
    "right": "q2r4",
    "encounter": [
      6,
      6
    ],
    "foes": [
      {
        "faces": 6,
        "variant": "normal"
      },
      {
        "faces": 6,
        "variant": "shiny"
      }
    ],
    "quest": 2,
    "final": false,
    "stageTwo": false
  },
  "q2r4": {
    "name": "Miners’ Vault",
    "subtitle": "Mixed foes and concealed treasure",
    "left": "q2r3",
    "right": "q2r5",
    "encounter": [
      6,
      8
    ],
    "foes": [
      {
        "faces": 6,
        "variant": "normal"
      },
      {
        "faces": 8,
        "variant": "normal"
      }
    ],
    "quest": 2,
    "final": false,
    "stageTwo": false
  },
  "q2r5": {
    "name": "Crystal Heart",
    "subtitle": "Boss D12 with a Shiny D6 guard",
    "left": "q2r4",
    "right": null,
    "encounter": [
      12,
      6
    ],
    "foes": [
      {
        "faces": 12,
        "variant": "boss"
      },
      {
        "faces": 6,
        "variant": "shiny"
      }
    ],
    "quest": 2,
    "final": true,
    "stageTwo": false
  },
  "q3r1": {
    "name": "Trampled Trail",
    "subtitle": "Ordinary dice on a gigantic woodland trail",
    "left": null,
    "right": "q3r2",
    "encounter": [
      4
    ],
    "foes": [
      {
        "faces": 4,
        "variant": "normal"
      }
    ],
    "quest": 3,
    "final": false,
    "stageTwo": false
  },
  "q3r2": {
    "name": "Giant’s Clearing",
    "subtitle": "The first true 2×2 Large D4",
    "left": "q3r1",
    "right": "q3r3",
    "encounter": [
      4
    ],
    "foes": [
      {
        "faces": 4,
        "variant": "large"
      }
    ],
    "quest": 3,
    "final": false,
    "stageTwo": false
  },
  "q3r3": {
    "name": "Root Maze",
    "subtitle": "Narrow hero shortcuts, wide routes for a Large D6",
    "left": "q3r2",
    "right": "q3r4",
    "encounter": [
      6
    ],
    "foes": [
      {
        "faces": 6,
        "variant": "large"
      }
    ],
    "quest": 3,
    "final": false,
    "stageTwo": false
  },
  "q3r4": {
    "name": "Hollow Tree",
    "subtitle": "Large D8, smaller enemies and hidden loot",
    "left": "q3r3",
    "right": "q3r5",
    "encounter": [
      8,
      4
    ],
    "foes": [
      {
        "faces": 8,
        "variant": "large"
      },
      {
        "faces": 4,
        "variant": "normal"
      }
    ],
    "quest": 3,
    "final": false,
    "stageTwo": false
  },
  "q3r5": {
    "name": "Elder Grove",
    "subtitle": "Boss D12 and Large D6",
    "left": "q3r4",
    "right": null,
    "encounter": [
      12,
      6
    ],
    "foes": [
      {
        "faces": 12,
        "variant": "boss"
      },
      {
        "faces": 6,
        "variant": "large"
      }
    ],
    "quest": 3,
    "final": true,
    "stageTwo": false
  },
  "q4r1": {
    "name": "Quarry Entrance",
    "subtitle": "Ordinary dice at a forgotten golden quarry",
    "left": null,
    "right": "q4r2",
    "encounter": [
      6
    ],
    "foes": [
      {
        "faces": 6,
        "variant": "normal"
      }
    ],
    "quest": 4,
    "final": false,
    "stageTwo": false
  },
  "q4r2": {
    "name": "Golden Passage",
    "subtitle": "Large D4 and Shiny D4, separately",
    "left": "q4r1",
    "right": "q4r3",
    "encounter": [
      4,
      4
    ],
    "foes": [
      {
        "faces": 4,
        "variant": "large"
      },
      {
        "faces": 4,
        "variant": "shiny"
      }
    ],
    "quest": 4,
    "final": false,
    "stageTwo": false
  },
  "q4r3": {
    "name": "Crystal Pit",
    "subtitle": "A single Large Shiny D4",
    "left": "q4r2",
    "right": "q4r4",
    "encounter": [
      4
    ],
    "foes": [
      {
        "faces": 4,
        "variant": "large-shiny"
      }
    ],
    "quest": 4,
    "final": false,
    "stageTwo": false
  },
  "q4r4": {
    "name": "Abandoned Workings",
    "subtitle": "Mixed enemies and valuable hidden treasure",
    "left": "q4r3",
    "right": "q4r5",
    "encounter": [
      6,
      8
    ],
    "foes": [
      {
        "faces": 6,
        "variant": "normal"
      },
      {
        "faces": 8,
        "variant": "normal"
      }
    ],
    "quest": 4,
    "final": false,
    "stageTwo": false
  },
  "q4r5": {
    "name": "King’s Excavation",
    "subtitle": "Large Shiny D4 first, then the Boss D12",
    "left": "q4r4",
    "right": null,
    "encounter": [
      4
    ],
    "foes": [
      {
        "faces": 4,
        "variant": "large-shiny"
      }
    ],
    "quest": 4,
    "final": true,
    "stageTwo": true
  }
,
  "q5r1": {"name":"Caravan Gate","subtitle":"Caravan guards at the desert entrance","left":null,"right":"q5r2","encounter":[6,6],"foes":[{"faces":6,"variant":"normal","role":"swift"},{"faces":6,"variant":"normal","role":"normal"}],"quest":5,"final":false,"stageTwo":false},
  "q5r2": {"name":"Rushing Dunes","subtitle":"Swift D6 moves twice as far as an ordinary foe","left":"q5r1","right":"q5r3","encounter":[6,6,8],"foes":[{"faces":6,"variant":"normal","role":"swift"},{"faces":6,"variant":"normal","role":"swift"},{"faces":8,"variant":"normal","role":"normal"}],"quest":5,"final":false,"stageTwo":false},
  "q5r3": {"name":"Archers’ Ridge","subtitle":"Ranged D6 can shoot up to two tiles","left":"q5r2","right":"q5r4","encounter":[6,8,6],"foes":[{"faces":6,"variant":"normal","role":"ranged"},{"faces":8,"variant":"normal","role":"normal"},{"faces":6,"variant":"normal","role":"ranged"}],"quest":5,"final":false,"stageTwo":false},
  "q5r4": {"name":"Iron Caravan","subtitle":"Armoured D8 absorbs part of each hit","left":"q5r3","right":"q5r5","encounter":[8,8,6],"foes":[{"faces":8,"variant":"normal","role":"armoured"},{"faces":8,"variant":"normal","role":"normal"},{"faces":6,"variant":"normal","role":"normal"}],"quest":5,"final":false,"stageTwo":false},
  "q5r5": {"name":"The Broken Crossing","subtitle":"Swift and Ranged defenders combine","left":"q5r4","right":"q5r6","encounter":[8,6,8],"foes":[{"faces":8,"variant":"normal","role":"swift"},{"faces":6,"variant":"normal","role":"ranged"},{"faces":8,"variant":"normal","role":"normal"}],"quest":5,"final":false,"stageTwo":false},
  "q5r6": {"name":"The Shieldwall","subtitle":"Armoured dice defend the archers","left":"q5r5","right":"q5r7","encounter":[8,6,8],"foes":[{"faces":8,"variant":"normal","role":"armoured"},{"faces":6,"variant":"normal","role":"ranged"},{"faces":8,"variant":"normal","role":"armoured"}],"quest":5,"final":false,"stageTwo":false},
  "q5r7": {"name":"Smuggler’s Station","subtitle":"Mixed opponents and hidden treasure","left":"q5r6","right":"q5r8","encounter":[8,8,8,6],"foes":[{"faces":8,"variant":"normal","role":"swift"},{"faces":8,"variant":"normal","role":"ranged"},{"faces":8,"variant":"normal","role":"armoured"},{"faces":6,"variant":"normal","role":"normal"}],"quest":5,"final":false,"stageTwo":false},
  "q5r8": {"name":"The High Roller’s Toll","subtitle":"Boss D16 with coordinated protection","left":"q5r7","right":null,"encounter":[16,8,8,6],"foes":[{"faces":16,"variant":"boss","role":"normal"},{"faces":8,"variant":"normal","role":"armoured"},{"faces":8,"variant":"normal","role":"ranged"},{"faces":6,"variant":"normal","role":"swift"}],"quest":5,"final":true,"stageTwo":false},
  "q6r1": {"name":"Misty Causeway","subtitle":"Enter the flooded graveyard","left":null,"right":"q6r2","encounter":[8,6],"foes":[{"faces":8,"variant":"normal","role":"normal"},{"faces":6,"variant":"normal","role":"zombie"}],"quest":6,"final":false,"stageTwo":false},
  "q6r2": {"name":"Graves That Stir","subtitle":"Zombies rise again after their first defeat","left":"q6r1","right":"q6r3","encounter":[6,8,8],"foes":[{"faces":6,"variant":"normal","role":"zombie"},{"faces":8,"variant":"normal","role":"zombie"},{"faces":8,"variant":"normal","role":"normal"}],"quest":6,"final":false,"stageTwo":false},
  "q6r3": {"name":"Whispering Crypt","subtitle":"Ghosts pass through solid walls","left":"q6r2","right":"q6r4","encounter":[8,6,8],"foes":[{"faces":8,"variant":"normal","role":"ghost"},{"faces":6,"variant":"normal","role":"ghost"},{"faces":8,"variant":"normal","role":"normal"}],"quest":6,"final":false,"stageTwo":false},
  "q6r4": {"name":"The Flickering Moor","subtitle":"Teleporters blink between safe floor tiles","left":"q6r3","right":"q6r5","encounter":[8,8,6],"foes":[{"faces":8,"variant":"normal","role":"teleporter"},{"faces":8,"variant":"normal","role":"normal"},{"faces":6,"variant":"normal","role":"teleporter"}],"quest":6,"final":false,"stageTwo":false},
  "q6r5": {"name":"Sunken Graves","subtitle":"Zombies advance beside ordinary enemies","left":"q6r4","right":"q6r6","encounter":[8,10,8],"foes":[{"faces":8,"variant":"normal","role":"zombie"},{"faces":10,"variant":"normal","role":"zombie"},{"faces":8,"variant":"normal","role":"normal"}],"quest":6,"final":false,"stageTwo":false},
  "q6r6": {"name":"The Haunted Crossing","subtitle":"Ghosts and Teleporters combine","left":"q6r5","right":"q6r7","encounter":[8,8,8],"foes":[{"faces":8,"variant":"normal","role":"ghost"},{"faces":8,"variant":"normal","role":"teleporter"},{"faces":8,"variant":"normal","role":"normal"}],"quest":6,"final":false,"stageTwo":false},
  "q6r7": {"name":"Crypts of the Lost","subtitle":"Mixed undead and hidden treasure","left":"q6r6","right":"q6r8","encounter":[10,8,10,8],"foes":[{"faces":10,"variant":"normal","role":"zombie"},{"faces":8,"variant":"normal","role":"ghost"},{"faces":10,"variant":"normal","role":"teleporter"},{"faces":8,"variant":"normal","role":"normal"}],"quest":6,"final":false,"stageTwo":false},
  "q6r8": {"name":"The Drowned Mausoleum","subtitle":"Boss D20 undead guardian and its followers","left":"q6r7","right":null,"encounter":[20,8,8,10],"foes":[{"faces":20,"variant":"boss","role":"normal"},{"faces":8,"variant":"normal","role":"ghost"},{"faces":8,"variant":"normal","role":"zombie"},{"faces":10,"variant":"normal","role":"teleporter"}],"quest":6,"final":true,"stageTwo":false},
  "q7r1": {"name":"Stone Steps","subtitle":"Climb to the mountain monastery","left":null,"right":"q7r2","encounter":[8,8],"foes":[{"faces":8,"variant":"normal","role":"normal"},{"faces":8,"variant":"normal","role":"ninja"}],"quest":7,"final":false,"stageTwo":false},
  "q7r2": {"name":"The Watchful Hall","subtitle":"Ninjas flank, withdraw and regroup","left":"q7r1","right":"q7r3","encounter":[8,10,8],"foes":[{"faces":8,"variant":"normal","role":"ninja"},{"faces":10,"variant":"normal","role":"ninja"},{"faces":8,"variant":"normal","role":"normal"}],"quest":7,"final":false,"stageTwo":false},
  "q7r3": {"name":"Hall of Mirrors","subtitle":"Cloners make weaker copies every third phase","left":"q7r2","right":"q7r4","encounter":[8,8,10],"foes":[{"faces":8,"variant":"normal","role":"cloner"},{"faces":8,"variant":"normal","role":"normal"},{"faces":10,"variant":"normal","role":"normal"}],"quest":7,"final":false,"stageTwo":false},
  "q7r4": {"name":"The Infirmary","subtitle":"Group Healers restore nearby allies","left":"q7r3","right":"q7r5","encounter":[8,10,8],"foes":[{"faces":8,"variant":"normal","role":"healer"},{"faces":10,"variant":"normal","role":"armoured"},{"faces":8,"variant":"normal","role":"normal"}],"quest":7,"final":false,"stageTwo":false},
  "q7r5": {"name":"The Silent Courtyard","subtitle":"Ninjas protect their Healers","left":"q7r4","right":"q7r6","encounter":[10,8,8],"foes":[{"faces":10,"variant":"normal","role":"ninja"},{"faces":8,"variant":"normal","role":"healer"},{"faces":8,"variant":"normal","role":"normal"}],"quest":7,"final":false,"stageTwo":false},
  "q7r6": {"name":"Chamber of Copies","subtitle":"Cloners and Ninjas combine","left":"q7r5","right":"q7r7","encounter":[8,10,8],"foes":[{"faces":8,"variant":"normal","role":"cloner"},{"faces":10,"variant":"normal","role":"ninja"},{"faces":8,"variant":"normal","role":"normal"}],"quest":7,"final":false,"stageTwo":false},
  "q7r7": {"name":"The Hidden Archives","subtitle":"All three behaviours and hidden treasure","left":"q7r6","right":"q7r8","encounter":[8,8,10,8],"foes":[{"faces":8,"variant":"normal","role":"ninja"},{"faces":8,"variant":"normal","role":"cloner"},{"faces":10,"variant":"normal","role":"healer"},{"faces":8,"variant":"normal","role":"normal"}],"quest":7,"final":false,"stageTwo":false},
  "q7r8": {"name":"The Abbot’s Chamber","subtitle":"Boss Ninja D20, Cloner and Group Healer support","left":"q7r7","right":null,"encounter":[20,10,10,8],"foes":[{"faces":20,"variant":"boss","role":"ninja"},{"faces":10,"variant":"normal","role":"cloner"},{"faces":10,"variant":"normal","role":"healer"},{"faces":8,"variant":"normal","role":"ninja"}],"quest":7,"final":true,"stageTwo":false}
};

// Quests 8 and 9 only: original Medium rooms, distinct encounters and eight-room quest chains.
Object.assign(ROOM_DATA, {"q8r1": {"name": "Broken Assembly", "subtitle": "Enter the abandoned dice factory", "left": null, "right": "q8r2", "encounter": [12, 12, 10, 10, 10, 10, 10], "foes": [{"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 10, "variant": "normal", "role": "normal"}, {"faces": 10, "variant": "normal", "role": "swift"}, {"faces": 10, "variant": "normal", "role": "armoured"}, {"faces": 10, "variant": "normal", "role": "ranged"}, {"faces": 10, "variant": "normal", "role": "normal"}], "quest": 8, "final": false, "stageTwo": false}, "q8r2": {"name": "Conveyor Passage", "subtitle": "Ranged defenders cover narrow approaches", "left": "q8r1", "right": "q8r3", "encounter": [12, 12, 12, 12, 10, 10, 10], "foes": [{"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "armoured"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 10, "variant": "normal", "role": "swift"}, {"faces": 10, "variant": "normal", "role": "ranged"}, {"faces": 10, "variant": "normal", "role": "normal"}], "quest": 8, "final": false, "stageTwo": false}, "q8r3": {"name": "Forging Floor", "subtitle": "Armoured protectors hold the central route", "left": "q8r2", "right": "q8r4", "encounter": [14, 12, 12, 12, 10, 12, 12], "foes": [{"faces": 14, "variant": "normal", "role": "armoured"}, {"faces": 12, "variant": "normal", "role": "armoured"}, {"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 10, "variant": "normal", "role": "armoured"}, {"faces": 12, "variant": "normal", "role": "swift"}, {"faces": 12, "variant": "normal", "role": "normal"}], "quest": 8, "final": false, "stageTwo": false}, "q8r4": {"name": "Repair Chamber", "subtitle": "Healers keep damaged sentries fighting", "left": "q8r3", "right": "q8r5", "encounter": [12, 10, 14, 12, 12, 12, 10], "foes": [{"faces": 12, "variant": "normal", "role": "healer"}, {"faces": 10, "variant": "normal", "role": "healer"}, {"faces": 14, "variant": "normal", "role": "armoured"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "ninja"}, {"faces": 10, "variant": "normal", "role": "normal"}], "quest": 8, "final": false, "stageTwo": false}, "q8r5": {"name": "The Production Line", "subtitle": "The first shielded firing line", "left": "q8r4", "right": "q8r6", "encounter": [14, 14, 12, 12, 12, 12, 12, 10], "foes": [{"faces": 14, "variant": "normal", "role": "ranged"}, {"faces": 14, "variant": "normal", "role": "armoured"}, {"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "swift"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 12, "variant": "normal", "role": "armoured"}, {"faces": 10, "variant": "normal", "role": "normal"}], "quest": 8, "final": false, "stageTwo": false}, "q8r6": {"name": "Counting Hall", "subtitle": "Two separated coordinated formations", "left": "q8r5", "right": "q8r7", "encounter": [14, 14, 12, 12, 12, 12, 10], "foes": [{"faces": 14, "variant": "normal", "role": "armoured"}, {"faces": 14, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "healer"}, {"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "swift"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 10, "variant": "normal", "role": "normal"}], "quest": 8, "final": false, "stageTwo": false}, "q8r7": {"name": "Vault of Dies", "subtitle": "Crossfire and hidden treasure", "left": "q8r6", "right": "q8r8", "encounter": [14, 12, 14, 12, 12, 12, 12, 10], "foes": [{"faces": 14, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 14, "variant": "normal", "role": "armoured"}, {"faces": 12, "variant": "normal", "role": "ninja"}, {"faces": 12, "variant": "normal", "role": "swift"}, {"faces": 12, "variant": "normal", "role": "healer"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 10, "variant": "normal", "role": "normal"}], "quest": 8, "final": false, "stageTwo": false}, "q8r8": {"name": "The Shattered Core", "subtitle": "Boss Armoured D20 and its final firing line", "left": "q8r7", "right": null, "encounter": [20, 14, 14, 12, 12, 12, 12, 12], "foes": [{"faces": 20, "variant": "boss", "role": "armoured"}, {"faces": 14, "variant": "normal", "role": "armoured"}, {"faces": 14, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "healer"}, {"faces": 12, "variant": "normal", "role": "swift"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 12, "variant": "normal", "role": "normal"}], "quest": 8, "final": true, "stageTwo": false}, "q9r1": {"name": "The Outer Burrow", "subtitle": "Swift scouts and a strange spawning nest", "left": null, "right": "q9r2", "encounter": [12, 12, 12, 10, 10, 10, 12], "foes": [{"faces": 12, "variant": "normal", "role": "swift"}, {"faces": 12, "variant": "normal", "role": "swift"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 10, "variant": "normal", "role": "normal"}, {"faces": 10, "variant": "normal", "role": "ranged"}, {"faces": 10, "variant": "normal", "role": "swift"}, {"faces": 12, "variant": "normal", "role": "normal"}], "quest": 9, "final": false, "stageTwo": false}, "q9r2": {"name": "Splintering Passages", "subtitle": "Faster swarms and a second nesting chamber", "left": "q9r1", "right": "q9r3", "encounter": [14, 12, 12, 12, 10, 12, 10], "foes": [{"faces": 14, "variant": "normal", "role": "swift"}, {"faces": 12, "variant": "normal", "role": "swift"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 10, "variant": "normal", "role": "cloner"}, {"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 10, "variant": "normal", "role": "normal"}], "quest": 9, "final": false, "stageTwo": false}, "q9r3": {"name": "The Crystal Maze", "subtitle": "Two original Cloners at most", "left": "q9r2", "right": "q9r4", "encounter": [12, 12, 12, 12, 12, 12, 10], "foes": [{"faces": 12, "variant": "normal", "role": "cloner"}, {"faces": 12, "variant": "normal", "role": "cloner"}, {"faces": 12, "variant": "normal", "role": "ninja"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 12, "variant": "normal", "role": "swift"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 10, "variant": "normal", "role": "normal"}], "quest": 9, "final": false, "stageTwo": false}, "q9r4": {"name": "The Breeding Hollows", "subtitle": "Up to three original Cloners and active nests", "left": "q9r3", "right": "q9r5", "encounter": [14, 12, 12, 12, 14, 10, 12], "foes": [{"faces": 14, "variant": "normal", "role": "cloner"}, {"faces": 12, "variant": "normal", "role": "cloner"}, {"faces": 12, "variant": "normal", "role": "cloner"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 14, "variant": "normal", "role": "swift"}, {"faces": 10, "variant": "normal", "role": "normal"}, {"faces": 12, "variant": "normal", "role": "ranged"}], "quest": 9, "final": false, "stageTwo": false}, "q9r5": {"name": "Tunnel of Mirrors", "subtitle": "Teleporters and multiplying defenders", "left": "q9r4", "right": "q9r6", "encounter": [14, 14, 12, 12, 12, 14, 12], "foes": [{"faces": 14, "variant": "normal", "role": "teleporter"}, {"faces": 14, "variant": "normal", "role": "cloner"}, {"faces": 12, "variant": "normal", "role": "ninja"}, {"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 14, "variant": "normal", "role": "swift"}, {"faces": 12, "variant": "normal", "role": "normal"}], "quest": 9, "final": false, "stageTwo": false}, "q9r6": {"name": "The Shifting Hive", "subtitle": "Swift and Teleporter swarms", "left": "q9r5", "right": "q9r7", "encounter": [14, 14, 12, 12, 12, 12, 12, 10], "foes": [{"faces": 14, "variant": "normal", "role": "swift"}, {"faces": 14, "variant": "normal", "role": "teleporter"}, {"faces": 12, "variant": "normal", "role": "swift"}, {"faces": 12, "variant": "normal", "role": "cloner"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 10, "variant": "normal", "role": "normal"}], "quest": 9, "final": false, "stageTwo": false}, "q9r7": {"name": "The Thousandfold Gate", "subtitle": "Up to four Cloners; dangerous nest burst", "left": "q9r6", "right": "q9r8", "encounter": [14, 12, 12, 12, 14, 14, 12, 12], "foes": [{"faces": 14, "variant": "normal", "role": "cloner"}, {"faces": 12, "variant": "normal", "role": "cloner"}, {"faces": 12, "variant": "normal", "role": "cloner"}, {"faces": 12, "variant": "normal", "role": "cloner"}, {"faces": 14, "variant": "normal", "role": "swift"}, {"faces": 14, "variant": "normal", "role": "ninja"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 12, "variant": "normal", "role": "normal"}], "quest": 9, "final": false, "stageTwo": false}, "q9r8": {"name": "The Swarm Throne", "subtitle": "Boss Cloner D20, escorts and the last nest", "left": "q9r7", "right": null, "encounter": [20, 14, 14, 14, 12, 12, 12, 12], "foes": [{"faces": 20, "variant": "boss", "role": "cloner"}, {"faces": 14, "variant": "normal", "role": "cloner"}, {"faces": 14, "variant": "normal", "role": "swift"}, {"faces": 14, "variant": "normal", "role": "teleporter"}, {"faces": 12, "variant": "normal", "role": "ninja"}, {"faces": 12, "variant": "normal", "role": "normal"}, {"faces": 12, "variant": "normal", "role": "ranged"}, {"faces": 12, "variant": "normal", "role": "normal"}], "quest": 9, "final": true, "stageTwo": false}} );

// 1 Nov Medium escalation: preserve all original rooms, role introductions and bosses,
// but upgrade the arena encounters to purposeful, mixed groups. The new roster is
// server-authoritative, not a client-side cosmetic multiplier.
const MEDIUM_REINFORCEMENTS = {
  5: ["normal:8 normal:8 swift:8", "swift:8 normal:8 normal:10", "ranged:10 normal:8 swift:8", "armoured:10 swift:8 armoured:8", "swift:10 ranged:8 armoured:10", "armoured:10 ranged:8 normal:10", "ranged:10 armoured:10 swift:10", "armoured:12 ranged:10 swift:10"],
  6: ["zombie:8 normal:10 zombie:8 normal:8", "zombie:10 normal:10 zombie:8", "ghost:10 zombie:10 ghost:8", "teleporter:10 ghost:8 normal:10", "zombie:10 ghost:10 teleporter:10 normal:10", "teleporter:10 ghost:10 zombie:10 normal:10", "ghost:12 zombie:10 teleporter:10", "ghost:12 teleporter:12 zombie:12 normal:10"],
  7: ["ninja:12 normal:10 ninja:10 normal:12 normal:10", "ninja:12 normal:12 ninja:10 normal:10", "cloner:12 ninja:12 normal:10 normal:12", "healer:12 ninja:12 armoured:12 normal:10", "ninja:12 healer:12 ninja:10 normal:12", "cloner:12 ninja:12 normal:12 healer:10", "ninja:12 cloner:10 healer:12 armoured:12", "ninja:14 armoured:12 healer:12 normal:12"]
};
Object.assign(ROOM_DATA,HARD_ENCOUNTERS,EXTREME_ENCOUNTERS);
for(const [quest,rosters] of Object.entries(MEDIUM_REINFORCEMENTS))for(const [index,roster] of rosters.entries()){
  const room=ROOM_DATA[`q${quest}r${index+1}`];
  const extra=roster.split(' ').map(entry=>{const [role,faces]=entry.split(':');return {faces:Number(faces),variant:'normal',role};});
  room.foes.push(...extra);room.encounter=room.foes.map(enemy=>enemy.faces);
}
// Every post-tutorial room has its own terrain, encounter formation and tactical hook.
for(const [room,plan] of Object.entries({...ROOM_CHALLENGES,...MEDIUM_BRIDGE_CHALLENGES}))Object.assign(ROOM_DATA[room],plan);
ROOM_DATA.camp={name:'Adventurers’ Camp',subtitle:'Quest board, supplies and the travelling merchant',left:null,right:null,encounter:[],foes:[],quest:0,final:false,stageTwo:false};
export const ROOM_IDS=Object.keys(ROOM_DATA);
export const WIDTH=9,HEIGHT=7,ROUND_MS=60_000; // Base rooms stay 9 × 7.
export const roomSize=roomId=>(ROOM_DATA[roomId]?.quest>=10?{width:15,height:11}:ROOM_DATA[roomId]?.quest>=5?{width:13,height:9}:{width:WIDTH,height:HEIGHT});
export const doorRow=roomId=>Math.floor(roomSize(roomId).height/2);
// Purpose-built terrain blocks movement, enemy footprints and ranged line of sight.
// Base nine-by-seven sketches use # for walls and . for floor. Medium quests have thirteen-by-nine arenas.
// Beginner rooms are comparatively open; Easy rooms introduce corridors/choke-points.
// Medium quests feature connected maze corridors, not perimeter-only walls.
const WALL_LAYOUTS={
  woodland: ['.........', '...##....', '...#.....', '.........', '.....#...', '..#..##..', '.........'],
  clearing: ['.........', '..##.....', '.....#...', '.........', '..#...#..', '..#..##..', '.........'],
  watchpost: ['.........', '..#...#..', '..#...#..', '.........', '..#...#..', '..#..##..', '.........'],
  q2r1: ['.........', '..###.#..', '....#.#..', '.........', '..#...##.', '..##..##.', '.........'],
  q2r2: ['.........', '.###..#..', '.....##..', '.........', '..##.....', '..##.##..', '.........'],
  q2r3: ['.........', '..###.##.', '..#......', '.........', '.....##..', '..#..##..', '.........'],
  q2r4: ['.........', '..##..##.', '..##.....', '.........', '....###..', '..##.##..', '.........'],
  q2r5: ['.........', '.##..###.', '..#......', '.........', '.....##..', '.###..##.', '.........'],
  q3r1: ['....#....', '..###.##.', '.........', '.........', '....###..', '..##..##.', '..#......'],
  q3r2: ['..#......', '.###..##.', '.........', '.........', '..###....', '..#...##.', '....#....'],
  q3r3: ['....#....', '.###..##.', '.........', '.........', '....###..', '.###..##.', '..#......'],
  q3r4: ['..#......', '..##..##.', '.........', '.........', '.....##..', '.###..##.', '....#....'],
  q3r5: ['....#....', '.###..##.', '.........', '.........', '.....###.', '..###.##.', '..#......'],
  q4r1: ['...#.#...', '.###..##.', '.........', '.........', '..##.##..', '.###..##.', '..#..#...'],
  q4r2: ['..#....#.', '..###.##.', '.........', '.........', '..##.##..', '..###.##.', '..#......'],
  q4r3: ['...#.#...', '.###..##.', '.........', '.........', '....###..', '.###..##.', '.....#...'],
  q4r4: ['..#....#.', '.###..##.', '.........', '.........', '..###.##.', '..##..##.', '.....#...'],
  q4r5: ['...#.#...', '..##..##.', '.........', '.........', '..##..##.', '.###..##.', '.....#...'],
  q7r8: ['###.#.##.', '.#..#..#.', '.........', '.........', '.........', '..##.....', '#.##.##.#'],
  q7r7: ['##.###.##', '#......#.', '.........', '.........', '.........', '...#..#.#', '#.##.##.#'],
  q7r6: ['#.###.##.', '...#..#..', '.........', '.........', '.........', '#..#...#.', '##.###.##'],
  q7r5: ['###.##.##', '.#.......', '.........', '.........', '.........', '....#....', '##.##.##.'],
  q7r4: ['##.##.###', '#..#..#..', '.........', '.........', '.........', '#...#....', '#.###.##.'],
  q7r3: ['##.##.###', '.......#.', '.........', '.........', '.........', '.#...#.#.', '##.###.##'],
  q7r2: ['###.#.##.', '.#..#..#.', '.........', '.........', '.........', '...#.....', '#.##.##.#'],
  q7r1: ['##.###.##', '...#...#.', '.........', '.........', '.........', '...#..#.#', '#.##.##.#'],
  q6r8: ['#.###.##.', '...#..#..', '.........', '.........', '.........', '#..#...#.', '##.###.##'],
  q6r7: ['###.##.##', '.#.......', '.........', '.........', '.........', '....#....', '##.##.##.'],
  q6r6: ['##.##.###', '#..#..#..', '.........', '.........', '.........', '....#.#..', '#.###.##.'],
  q6r5: ['##.##.###', '.........', '.........', '.........', '.........', '.#...#.#.', '##.###.##'],
  q6r4: ['###.#.##.', '.#..#..#.', '.........', '.........', '.........', '..##.....', '#.##.##.#'],
  q6r3: ['##.###.##', '#......#.', '.........', '.........', '.........', '...#..#.#', '#.##.##.#'],
  q6r2: ['#.###.##.', '...#..#..', '.........', '.........', '.........', '#..#...#.', '##.###.##'],
  q6r1: ['###.##.##', '.#.......', '.........', '.........', '.........', '....#....', '##.##.##.'],
  q5r8: ['##.##.###', '#..#..#..', '.........', '.........', '.........', '#...#.#..', '#.###.##.'],
  q5r7: ['##.##.###', '.......#.', '.........', '.........', '.........', '.#...#.#.', '##.###.##'],
  q5r6: ['###.#.##.', '.#..#..#.', '.........', '.........', '.........', '..##.....', '#.##.##.#'],
  q5r5: ['##.###.##', '#..#...#.', '.........', '.........', '.........', '...#..#.#', '#.##.##.#'],
  q5r4: ['#.###.##.', '...#..#..', '.........', '.........', '.........', '#..#...#.', '##.###.##'],
  q5r3: ['###.##.##', '.#.......', '.........', '.........', '.........', '....#....', '##.##.##.'],
  q5r2: ['##.##.###', '#..#..#..', '.........', '.........', '.........', '....#.#..', '#.###.##.'],
  q5r1: ['##.##.###', '.........', '.........', '.........', '.........', '.#...#.#.', '##.###.##'],
};
// Hand-authored room-by-room designs replace the repetitive four-template maze
// generator. Their terrain must be stable on reload and identical across clients.
for(const [id,rows] of Object.entries({...ROOM_BLUEPRINTS,...MEDIUM_BRIDGE_BLUEPRINTS,...HARD_BLUEPRINTS,...EXTREME_BLUEPRINTS}))WALL_LAYOUTS[id]=rows;
export const ROOM_WALLS=Object.fromEntries(Object.entries(WALL_LAYOUTS).map(([room,rows])=>[
  room, rows.flatMap((row,y)=>[...row].flatMap((tile,x)=>tile==='#'?[[x,y]]:[]))
]));
ROOM_WALLS.camp=[];
export const HARD_HAZARDS=Object.fromEntries(Object.entries({...HARD_BLUEPRINTS,...EXTREME_BLUEPRINTS}).filter(([roomId])=>ROOM_DATA[roomId].hazard==='chaos'||ROOM_DATA[roomId].hazard==='tide'||ROOM_DATA[roomId].hazard==='flood'||ROOM_DATA[roomId].hazard==='storm').map(([roomId,rows])=>{
 const seed=Number(roomId.match(/r(\d+)/)[1]), tiles=[];
 for(let y=1;y<rows.length-1;y++)for(let x=3;x<rows[0].length-3;x++)if(rows[y][x]==='.' && (((x*11+y*7+seed*13+ROOM_DATA[roomId].quest)%11===0)||(((x+seed*2)%6===0)&&(y===(seed%5+2)))))tiles.push([x,y]);
 return [roomId,tiles];
}));
export function isWall(roomId,x,y){return !!ROOM_WALLS[roomId]?.some(([wx,wy])=>wx===x&&wy===y)}
export function clearLine(roomId,ax,ay,bx,by){
  if(isWall(roomId,ax,ay)||isWall(roomId,bx,by))return false;
  // Centre-to-centre grid ray; a corner grazing a wall cannot shoot through it.
  let x=ax,y=ay;const dx=Math.abs(bx-ax),dy=Math.abs(by-ay),sx=ax<bx?1:-1,sy=ay<by?1:-1;let err=dx-dy;
  while(x!==bx||y!==by){const double=2*err;const oldx=x,oldy=y;
    if(double>-dy){err-=dy;x+=sx}if(double<dx){err+=dx;y+=sy}
    if(isWall(roomId,x,y))return false;
    if(x!==oldx&&y!==oldy&&(isWall(roomId,oldx,y)&&isWall(roomId,x,oldy)))return false;
  }return true;
}

// Four permanently selectable hero classes. Existing legacy characters retain
// their level, inventory, coins and achievements when choosing for the first time.
export const CLASS_DATA={
 knight:{label:'Knight',hp:50,atk:12,arm:8,range:1,description:'Steady frontline defender',starter:'Sword'},
 outlaw:{label:'Outlaw',hp:44,atk:14,arm:6,range:1,description:'Fast and aggressive scout',starter:'Bow'},
 warlock:{label:'Warlock',hp:40,atk:16,arm:4,range:2,description:'Arcane attacker who specialises in staffs',starter:'Staff'},
 tinker:{label:'Tinker',hp:48,atk:10,arm:10,range:1,description:'Resilient field inventor and equipment specialist',starter:'Mace'}
};
// Class perks: independent 25% increases to successful eligible search chances.
// All rolls are performed on the server; no rarities or rare-item odds are altered.
export const CLASS_PERKS=Object.freeze({
 knight:{search:'Equipment searches: +25% chance to find',cost:'Maces and Plate Mail: 25% cheaper',combat:'Mace attacks +D2 / Plate Mail blocks +D2'},
 outlaw:{search:'Gold discoveries: +25% coins',cost:'Swords and Shields: 25% cheaper',combat:'Sword attacks +D2 / Shield blocks +D2'},
 warlock:{search:'Potion searches: +25% chance to find',cost:'Staffs and Guardian Tonic: 25% cheaper',combat:'Staff attacks +D4'},
 tinker:{search:'Enchantment searches: +25% chance to find',cost:'Superstrength, Meteors, Bombs and Guardian Tonic: 25% cheaper',combat:'Bombs and Meteors +D4'}
});
export function classFindChance(klass,slot,base=.5){return Math.min(1,base*((klass==='knight'&&slot==='equipment')||(klass==='warlock'&&slot==='potion')||(klass==='tinker'&&slot==='enchantment')?1.25:1));}
export function classGoldBonus(klass,gold){return klass==='outlaw'?Math.floor(gold*1.25):gold;}
export function classBonusAttackDie(p){if(!p?.classChosen)return 0;const main=(p.inventory?.equipment||[]).find(x=>x.id===p.equipped?.weapon);return (p.klass==='knight'&&main?.category==='Mace'||p.klass==='outlaw'&&main?.category==='Sword')?2:p.klass==='warlock'&&main?.category==='Staff'?4:0;}
export function classBonusDefenceDie(p){if(!p?.classChosen)return 0;const eq=p.inventory?.equipment||[];const armour=eq.find(x=>x.id===p.equipped?.armour),off=eq.find(x=>x.id===p.equipped?.offhand);return p.klass==='knight'&&armour?.category==='Armour'||p.klass==='outlaw'&&off?.category==='Shield'?2:0;}
export function classBombDie(p,sku){return p.classChosen&&p.klass==='tinker'&&['blast-bomb','meteor-scroll'].includes(sku)?4:0;}
export function classPrice(p,item,cityDiscount=false){const c=p?.classChosen?p.klass:null;const eligible=c==='knight'&&['Mace','Armour'].includes(item.category)||c==='outlaw'&&['Sword','Shield'].includes(item.category)||c==='warlock'&&(item.category==='Staff'||item.sku==='guardian-ward')||c==='tinker'&&['super-potion','meteor-scroll','blast-bomb','guardian-ward'].includes(item.sku);return Math.max(1,Math.ceil(item.cost*(eligible?.75:1)*(cityDiscount?.9:1)));}
export const LEVEL_CAP=30;
// Prototype progression uses the locked 100 XP to Level 2, then 1.4× per level.
// Encounter XP amounts are temporary lab values awaiting full quest balancing.
export function xpRequiredForLevel(level){
  return level>=LEVEL_CAP?0:Math.ceil(100*Math.pow(1.4,Math.max(0,level-1)));
}
// Phase 3B: classic DICEBOUND dice categories. Each attack is actually rolled;
// the shown D values are upper faces, not a guaranteed damage figure.
// Tier prices and complete shop balancing remain future work.
export const RARITY_DICE={Common:4,Uncommon:6,Rare:8,Legendary:12,Mythic:20,Exotic:30};
export const MEDIUM_LEGENDARY_CHANCE=.05; // Per eligible successful equipment find or merchant restock, never guaranteed.
const SWORD_SPECIALS={Legendary:{dice:[30],cooldown:3},Mythic:{dice:[40],cooldown:2},Exotic:{dice:[100,100],cooldown:5}};
const MACE_SPECIALS={Legendary:{dice:[12],targets:4,cooldown:3},Mythic:{dice:[20],targets:5,cooldown:2},Exotic:{dice:[30],targets:99,cooldown:5}};
const BOW_SPECIALS={Legendary:{dice:[12],targets:2,cooldown:3},Mythic:{dice:[20],targets:3,cooldown:2},Exotic:{dice:[30],targets:4,cooldown:2}};
const STAFF_SPECIALS={Legendary:{dice:[20],targets:2,cooldown:3},Mythic:{dice:[30],targets:3,cooldown:2},Exotic:{dice:[50],targets:4,cooldown:3}};
const isWeapon=item=>item&&['Sword','Bow','Mace','Staff'].includes(item.category);
function itemBonusDie(item){return item?Math.max(1,Math.floor(item.bonusDie||RARITY_DICE[item.rarity]||4)):0;}
function enchantBonus(item,school){return (item?.enchantments||[]).filter(e=>e.school===school).reduce((total,e)=>total+Math.max(0,Number(e.level)||0)*(school==='Sharpness'?3:2),0);}
function attackDieOf(item){return isWeapon(item)?itemBonusDie(item)+enchantBonus(item,'Sharpness'):0;}
export function rollDie(faces,random=Math.random){return 1+Math.floor(Math.min(.999999999999,Math.max(0,random()))*Math.max(1,Math.floor(faces)));}

export const LAB_HEAL_FRACTION=.30;
function equippedItem(p,slot){
  return (p.inventory?.equipment||[]).find(item=>item.id===p.equipped?.[slot])||null;
}
export function effectiveStats(player){
  const base=CLASS_DATA[player.klass]||CLASS_DATA.knight;
  const scale=Math.pow(1.2,Math.max(0,(player.level||1)-1));
  const weapon=equippedItem(player,'weapon');
  const offhand=equippedItem(player,'offhand');
  const armour=equippedItem(player,'armour');
  const baseAttack=Math.round(base.atk*scale);
  const baseArmour=Math.round(base.arm*scale);
  const boosted=player.superRoom===player.room&&player.superRoom!==undefined;
  const offhandDie=attackDieOf(offhand);
  const shieldArmour=offhand?.category==='Shield'?Math.max(2,Math.ceil(itemBonusDie(offhand)*.5)):0;
  const weaponDie=attackDieOf(weapon);
  return {
    attack:Math.round((baseAttack+weaponDie)*(boosted?2:1)),
    armour:Math.round((baseArmour+(armour?Math.max(2,Math.round(itemBonusDie(armour)*.6)):0)+enchantBonus(armour,'Fortification')+shieldArmour)*(boosted?2:1)),
    offhand:offhandDie, offhandMax:Math.ceil(offhandDie/2),
    classAttackDie:classBonusAttackDie(player),classDefenceDie:classBonusDefenceDie(player),
    maxHp:Math.round(base.hp*scale),
    range:Math.max(weapon?(weapon.category==='Sword'?1:['Bow','Staff'].includes(weapon.category)?3:2):base.range,offhand?(offhand.category==='Sword'?1:['Bow','Staff'].includes(offhand.category)?3:2):0),
    mainRange:weapon?(weapon.category==='Sword'?1:['Bow','Staff'].includes(weapon.category)?3:2):base.range,
    offhandRange:offhand?(offhand.category==='Sword'?1:['Bow','Staff'].includes(offhand.category)?3:2):0,
    weapon:weapon?.name||null, offhandItem:offhand?.name||null, armourItem:armour?.name||null,
    category:weapon?.category||null, rarity:weapon?.rarity||null,
    special:weapon?.category==='Sword'?SWORD_SPECIALS[weapon.rarity]||null:weapon?.category==='Mace'?MACE_SPECIALS[weapon.rarity]||null:weapon?.category==='Bow'?BOW_SPECIALS[weapon.rarity]||null:weapon?.category==='Staff'?STAFF_SPECIALS[weapon.rarity]||null:null,
    multishot:weapon?.category==='Bow'?Math.max(0,...(weapon.enchantments||[]).filter(e=>e.school==='Multishot').map(e=>e.level||0)):0
  };
}
export function awardXp(player,amount,state,now){
  ensureProgress(player);
  if(player.level>=LEVEL_CAP)return;
  player.xp+=amount;
  addLog(state,`${player.name} earned ${amount} XP.`,now);
  while(player.level<LEVEL_CAP && player.xp>=xpRequiredForLevel(player.level)){
    player.xp-=xpRequiredForLevel(player.level);
    const previousStats=effectiveStats(player);const oldMax=player.maxHp;player.level++;
    player.maxHp=effectiveStats(player).maxHp;
    if(player.hp>0)player.hp=Math.min(player.maxHp,player.hp+(player.maxHp-oldMax));
    const stipend=Math.round(40*Math.pow(1.5,player.level-1));player.gold=(player.gold||0)+stipend;
    addLog(state,`${player.name} received ${stipend} gold as their Level ${player.level} income.`,now);
    addLog(state,`${player.name} reached Level ${player.level}!`,now);
    const nextStats=effectiveStats(player);
    emitEvent(state,'level-up',{player:player.id,level:player.level,attack:nextStats.attack,armour:nextStats.armour,hp:player.maxHp,attackGain:nextStats.attack-previousStats.attack,armourGain:nextStats.armour-previousStats.armour,hpGain:player.maxHp-oldMax},now);
  }
  if(player.level===LEVEL_CAP)player.xp=0;
}

const directions={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]};
const nowMs=()=>Date.now();
export const LOOT_SLOTS=['coin','potion','equipment','enchantment'];
const COINS=[
  {name:'Small Bronze Coin',gold:5,p:1-(.20+.10+.10+.075+1/133+1/500)},
  {name:'Small Silver Coin',gold:10,p:.20},
  {name:'Small Gold Coin',gold:25,p:.10},
  {name:'Big Bronze Coin',gold:50,p:.10},
  {name:'Big Silver Coin',gold:100,p:.075},
  {name:'Big Gold Coin',gold:250,p:1/133},
  {name:'Coin of Ages',gold:1000,p:1/500}
];
const TIER_NAMES=['Common','Uncommon','Rare','Legendary','Mythic','Exotic'];
function weighted(list,random){let r=random();for(const value of list){r-=value.p;if(r<0)return value}return list.at(-1)}
function ensureProgress(player){
  player.level??=1;player.xp??=0;player.gold??=0;
  player.completedQuests=normalizedCompletions(player.completedQuests);
  player.unlockedQuest=unlockedQuestCeiling(player.completedQuests);
  // Existing saved character progress survives upgrades without being reset.
  player.level=Math.min(LEVEL_CAP,Math.max(1,Math.floor(player.level)));
  if(!Number.isFinite(player.xp)||player.xp<0)player.xp=0;
  player.inventory??={potions:[],equipment:[],enchantments:[],consumables:[]};
  for(const key of ['potions','equipment','enchantments','consumables'])player.inventory[key]??=[];
  player.wardCharges??=0;
  player.classChosen??=false;
  player.lootClaimed??={};
  player.equipped??={weapon:null,offhand:null,armour:null};
  player.equipped.offhand??=null;
  player.specialUsedAt??={};
  player.combatTurns??=0;
  player.questBookmarks??={};player.lastCampQuest??=null;
  player.trainingRackClaimed??=false;player.moveRemaining??=0;player.moveRound??=null;player.movementRolled??=false;
  player.nextItemNumber??=1;
  // A potion is now exactly one use. Expand old stacks into separate bottles
  // instead of destroying healing uses the players have already earned.
  if(player.inventory.potions.some(p=>p.charges>1)){
    player.inventory.potions=player.inventory.potions.flatMap(p=>{
      const count=Math.max(1,Math.min(1000,Math.floor(Number(p.charges)||1)));
      return Array.from({length:count},(_,i)=>({...p,charges:1,id:i===0?p.id:`${player.id}-potions-${player.nextItemNumber++}`}));
    });
  }
  // Assign stable IDs to items from previous versions of the saved adventure.
  // ID generation is server-side and the counter persists with the character.
  for(const kind of ['potions','equipment','enchantments']){
    for(const item of player.inventory[kind]){
      if(!item.id)item.id=`${player.id}-${kind}-${player.nextItemNumber++}`;
    }
  }
  for(const slot of ['weapon','offhand','armour']){
    if(!player.inventory.equipment.some(item=>item.id===player.equipped[slot]))player.equipped[slot]=null;
  }
  if(player.equipped.weapon&&player.equipped.weapon===player.equipped.offhand)player.equipped.offhand=null;
  // Saved upgrades never cause two equipment slots to reference the same item.
}
function itemId(p,kind){return `${p.id}-${kind}-${p.nextItemNumber++}`;}
function readyPlayer(s,id){
  const p=s.players[id];if(!p||!p.connected)throw new Error('Player is not connected');
  ensureProgress(p);return p;
}
function requireNoFight(s,p){
  if(s.rooms[p.room].battle.status==='active')throw new Error('Inventory changes are unavailable during combat');
  if(p.hp<=0)throw new Error('Downed players cannot change inventory');
}
export function equipItem(s,id,equipmentId,slotRequested=null,now=nowMs()){
  // Legacy direct callers supplied a timestamp as the fourth argument.
  if(typeof slotRequested==='number'){now=slotRequested;slotRequested=null;}
  const p=readyPlayer(s,id);requireNoFight(s,p);
  const item=p.inventory.equipment.find(x=>x.id===equipmentId);
  if(!item)throw new Error('Equipment is not in your backpack');
  if((item.level||1)>p.level)throw new Error('Your real character level is too low to equip this item');
  if(!['Armour','Shield','Sword','Mace','Bow','Staff'].includes(item.category))throw new Error('Unsupported equipment type');
  const slot=slotRequested|| (item.category==='Armour'?'armour':item.category==='Shield'?'offhand':'weapon');
  if(!['weapon','offhand','armour'].includes(slot))throw new Error('Invalid equipment slot');
  if(item.category==='Shield'&&slot!=='offhand')throw new Error('Shields must be equipped in the offhand slot');
  if(item.category==='Armour'&&slot!=='armour')throw new Error('Armour cannot go in a hand');
  if(item.category!=='Armour'&&slot==='armour')throw new Error('A weapon cannot go in the armour slot');
  // A one-handed weapon may be moved from main to off or vice versa, never cloned.
  for(const other of ['weapon','offhand','armour'])if(other!==slot&&p.equipped[other]===item.id)p.equipped[other]=null;
  p.equipped[slot]=item.id;
  addLog(s,`${p.name} equipped ${item.name}.`,now);s.revision++;
  return {saved:null};
}
export function unequipItem(s,id,slot,now=nowMs()){
  const p=readyPlayer(s,id);requireNoFight(s,p);
  if(!['weapon','offhand','armour'].includes(slot))throw new Error('Invalid equipment slot');
  if(!p.equipped[slot])throw new Error('Nothing equipped in that slot');
  p.equipped[slot]=null;
  addLog(s,`${p.name} unequipped ${slot}.`,now);s.revision++;
  return {saved:null};
}
export function bindEnchantment(s,id,enchantmentId,equipmentId,now=nowMs()){
  const p=readyPlayer(s,id);requireNoFight(s,p);
  const enchant=p.inventory.enchantments.find(x=>x.id===enchantmentId);
  const item=p.inventory.equipment.find(x=>x.id===equipmentId);
  if(!item||!enchant)throw new Error('Enchantment and item must belong to your backpack');
  if(!['Sharpness','Fortification','Multishot'].includes(enchant.school))throw new Error('Unsupported enchantment school');
  if(enchant.school==='Multishot'&&item.category!=='Bow')throw new Error('Multishot needs a Bow');
  if(enchant.school==='Fortification'&&item.category!=='Armour')throw new Error('Fortification needs armour');
  if(enchant.school==='Sharpness'&&item.category==='Armour')throw new Error('Sharpness needs a weapon');
  item.enchantments??=[];
  if(item.enchantments.some(x=>x.school===enchant.school))throw new Error('That item already has this enchantment school');
  // Binding is permanent: the enchantment is transferred from backpack to item.
  item.enchantments.push({...enchant});
  p.inventory.enchantments=p.inventory.enchantments.filter(x=>x.id!==enchantmentId);
  addLog(s,`${p.name} permanently bound ${enchant.name} to ${item.name}.`,now);s.revision++;
  return {saved:null};
}
function potionTarget(s,p,targetId){
  const target=s.players[targetId||p.id];
  if(!target||!target.connected||target.room!==p.room)throw new Error('Target is not nearby');
  if(target.id!==p.id&&dist(target,p)!==1)throw new Error('You must stand next to your teammate to heal them');
  if(target.hp<=0)throw new Error('A downed teammate needs Revive, not a potion');
  if(target.hp>=target.maxHp)throw new Error('Target already has full health');
  return target;
}
function healWithPotion(s,p,targetId,now,potionId=null){
  const target=potionTarget(s,p,targetId);
  const pot=p.inventory.potions.find(x=>x.charges>0&&(!potionId||x.id===potionId));
  if(!pot)throw new Error('No healing-potion charges remain');
  const healed=Math.min(target.maxHp-target.hp,Math.ceil(target.maxHp*LAB_HEAL_FRACTION));
  target.hp+=healed;pot.charges--;
  if(pot.charges===0)p.inventory.potions=p.inventory.potions.filter(x=>x.id!==pot.id);
  addLog(s,`${p.name} used one healing-potion charge on ${target.name} (+${healed} HP).`,now);
  s.revision++;
}
export function usePotion(s,id,targetId=null,now=nowMs()){
  const p=readyPlayer(s,id);
  if(p.hp<=0)throw new Error('Downed players cannot use potions');
  if(s.rooms[p.room].battle.status==='active')return submitSequentialAction(s,id,{type:'potion',target:targetId||id},now);
  healWithPotion(s,p,targetId||id,now);return {saved:null};
}
export const QUEST_MAX_RARITY={1:'Common',2:'Uncommon',3:'Uncommon',4:'Rare',5:'Legendary',6:'Legendary',7:'Legendary',8:'Legendary',9:'Legendary',10:'Mythic',11:'Mythic',12:'Mythic',13:'Exotic',14:'Exotic',15:'Exotic'};
export function equipmentRarity(quest,random=Math.random){
  const odds=quest<=1?[1,0,0]:quest===2?[.88,.12,0]:quest===3?[.82,.18,0]:quest===4?[.74,.23,.03]:quest<=9?[.57,.30,.08,.05]:quest<=12?[0,.57,.30,.08,.05]:[0,0,0,.57,.38,.05];
  let value=random();for(let i=0;i<odds.length;i++){value-=odds[i];if(value<0)return TIER_NAMES[i]}
  return TIER_NAMES[Math.min(odds.length-1,TIER_NAMES.length-1)];
}
function generatePickup(slot,player,random,quest){
  if(slot==='coin'){
    const c=weighted(COINS,random);return {kind:'coin',name:c.name,gold:c.gold};
  }
  if(slot==='potion'){
    return {kind:'potion',name:'Healing Potion',charges:1};
  }
  if(slot==='equipment'){
    const category=['Sword','Bow','Mace','Staff','Armour','Shield'][Math.floor(random()*6)];
    const rarity=equipmentRarity(quest,random);
    return {kind:'equipment',category,rarity,level:player.level,bonusDie:RARITY_DICE[rarity],name:`${rarity} ${category} · L${player.level}`};
  }
  // Multishot V remains a literal 1/1500 per enchantment pickup, never guaranteed.
  if((quest>=4)&&random()<1/1500)return {kind:'enchantment',name:'Multishot V',school:'Multishot',level:5};
  const school=['Sharpness','Fortification','Multishot'][Math.floor(random()*3)];
  const level=1+Math.floor(random()*(quest<=2?1:quest===3?2:3));
  return {kind:'enchantment',name:`${school} ${['I','II','III','IV'][level-1]}`,school,level};
}
/** Test-lab rack: scripted weapons to validate the combat port without
 * repeatedly rolling random drops. Exactly once per character; never a normal
 * four-pickup room treasure and never available in the real campaign.
 */
export function claimTrainingRack(s,id,now=nowMs()){
  const p=readyPlayer(s,id);requireNoFight(s,p);
  if(s.balanceTrial)throw new Error('Training gear is disabled for genuine balance testing');
  if(p.room!=='woodland')throw new Error('The training rack is only in the Woodland Path');
  if(p.trainingRackClaimed)throw new Error('You have already collected your training rack');
  const trial=[['Sword','Common'],['Bow','Uncommon'],['Mace','Rare'],['Staff','Rare'],['Sword','Legendary'],['Mace','Mythic'],['Sword','Exotic']];
  for(const [category,rarity] of trial){
    p.inventory.equipment.push({id:itemId(p,'equipment'),kind:'equipment',category,rarity,level:p.level,bonusDie:RARITY_DICE[rarity],name:`Training ${rarity} ${category} · L${p.level}`,enchantments:[],training:true});
  }
  p.inventory.enchantments.push({id:itemId(p,'enchantment'),name:'Multishot II · Training',school:'Multishot',level:2,training:true});
  p.trainingRackClaimed=true;
  addLog(s,`${p.name} collected their one-time combat training rack: six weapons and Multishot II.`,now);
  s.revision++;return {saved:null};
}

/** Room loot is individually claimable, at most once per player per slot per expedition.
 * The authoritative Durable Object serialises claims; the browser never decides the roll.
 */
export function claimLoot(state,id,slot,now=nowMs(),random=Math.random){
  const p=state.players[id];if(!p||!p.connected)throw new Error('Player is not connected');
  ensureProgress(p);
  if(!LOOT_SLOTS.includes(slot))throw new Error('Invalid treasure type');
  if(p.room==='camp')throw new Error('There is no room treasure at camp');
  const battle=state.rooms[p.room].battle;
  if(battle.status==='active')throw new Error('Defeat the enemies before collecting room treasure');
  p.lootClaimed[p.room]??={};
  if(p.lootClaimed[p.room][slot])throw new Error('You have already searched for this treasure');
  // Independent 50% empty outcome for every room search, including each category.
  // Preserve the one-search-per-player-per-room restriction even when empty.
  if(random()<1-classFindChance(p.classChosen?p.klass:null,slot)){
    p.lootClaimed[p.room][slot]=true;
    addLog(state,`${p.name} searched for ${slot} but found nothing.`,now);
    emitEvent(state,'search-empty',{player:id,slot},now);
    state.revision++;return {saved:null,item:null};
  }
  const item=generatePickup(slot,p,random,ROOM_DATA[p.room].quest||1);
  if(item.kind!=='coin')item.id=itemId(p,item.kind);
  if(item.kind==='equipment')item.enchantments=[];
  if(item.kind==='coin'){item.gold=classGoldBonus(p.classChosen?p.klass:null,item.gold);p.gold+=item.gold;}
  else if(item.kind==='potion')p.inventory.potions.push(item);
  else if(item.kind==='equipment')p.inventory.equipment.push(item);
  else p.inventory.enchantments.push(item);
  p.lootClaimed[p.room][slot]=true;
  addLog(state,`${p.name} collected ${item.name}${item.gold?' (+'+item.gold+' gold)':''}.`,now);
  emitEvent(state,'loot-found',{player:id,item:item.name},now);
  if(item.kind==='equipment'&&['Rare','Legendary','Mythic','Exotic'].includes(item.rarity))emitEvent(state,'rare-find',{player:id,item:item.name,rarity:item.rarity},now);
  if(item.name==='Coin of Ages')emitEvent(state,'rare-find',{player:id,item:item.name,rarity:'Mythic'},now);
  state.revision++;
  return {saved:null,item};
}
export const SHOP_STOCK=[
 {sku:'potion',name:'Healing Potion (1 use)',cost:10,kind:'potion'},
 {sku:'sword-common',name:'Common Sword',cost:45,kind:'equipment',category:'Sword',rarity:'Common'},
 {sku:'staff-common',name:'Common Staff',cost:45,kind:'equipment',category:'Staff',rarity:'Common'},
 {sku:'bow-common',name:'Common Bow',cost:45,kind:'equipment',category:'Bow',rarity:'Common'},
 {sku:'mace-common',name:'Common Mace',cost:35,kind:'equipment',category:'Mace',rarity:'Common'},
 {sku:'armour-common',name:'Common Armour',cost:35,kind:'equipment',category:'Armour',rarity:'Common'},
 {sku:'sword-uncommon',name:'Uncommon Sword',cost:100,kind:'equipment',category:'Sword',rarity:'Uncommon',unlock:2},
 {sku:'armour-uncommon',name:'Uncommon Armour',cost:95,kind:'equipment',category:'Armour',rarity:'Uncommon',unlock:2},
 {sku:'bow-uncommon',name:'Uncommon Bow',cost:95,kind:'equipment',category:'Bow',rarity:'Uncommon',unlock:2},
 {sku:'mace-uncommon',name:'Uncommon Mace',cost:120,kind:'equipment',category:'Mace',rarity:'Uncommon',unlock:2},
 {sku:'staff-uncommon',name:'Uncommon Staff',cost:100,kind:'equipment',category:'Staff',rarity:'Uncommon',unlock:2},
 {sku:'armour-rare',name:'Rare Armour',cost:170,kind:'equipment',category:'Armour',rarity:'Rare',unlock:4},
 {sku:'sword-rare',name:'Rare Sword',cost:170,kind:'equipment',category:'Sword',rarity:'Rare',unlock:4},
 {sku:'mace-rare',name:'Rare Mace',cost:200,kind:'equipment',category:'Mace',rarity:'Rare',unlock:4},
 {sku:'bow-rare',name:'Rare Bow',cost:170,kind:'equipment',category:'Bow',rarity:'Rare',unlock:5},
 {sku:'staff-rare',name:'Rare Staff',cost:180,kind:'equipment',category:'Staff',rarity:'Rare',unlock:5},
 {sku:'armour-legendary',name:'Legendary Armour',cost:400,kind:'equipment',category:'Armour',rarity:'Legendary',unlock:10},
 {sku:'sword-mythic',name:'Mythic Sword',cost:900,kind:'equipment',category:'Sword',rarity:'Mythic',unlock:10},
 {sku:'bow-mythic',name:'Mythic Bow',cost:900,kind:'equipment',category:'Bow',rarity:'Mythic',unlock:10},
 {sku:'mace-mythic',name:'Mythic Mace',cost:1200,kind:'equipment',category:'Mace',rarity:'Mythic',unlock:10},
 {sku:'staff-mythic',name:'Mythic Staff',cost:1000,kind:'equipment',category:'Staff',rarity:'Mythic',unlock:10},
 {sku:'armour-mythic',name:'Mythic Armour',cost:900,kind:'equipment',category:'Armour',rarity:'Mythic',unlock:10},
 {sku:'sword-exotic',name:'Exotic Sword',cost:3000,kind:'equipment',category:'Sword',rarity:'Exotic',unlock:13},
 {sku:'bow-exotic',name:'Exotic Bow',cost:3000,kind:'equipment',category:'Bow',rarity:'Exotic',unlock:13},
 {sku:'mace-exotic',name:'Exotic Mace',cost:4000,kind:'equipment',category:'Mace',rarity:'Exotic',unlock:13},
 {sku:'staff-exotic',name:'Exotic Staff',cost:3200,kind:'equipment',category:'Staff',rarity:'Exotic',unlock:13},
 {sku:'armour-exotic',name:'Exotic Armour',cost:3000,kind:'equipment',category:'Armour',rarity:'Exotic',unlock:13},
 {sku:'sword-legendary',name:'Legendary Sword',cost:400,kind:'equipment',category:'Sword',rarity:'Legendary',unlock:5},
 {sku:'bow-legendary',name:'Legendary Bow',cost:400,kind:'equipment',category:'Bow',rarity:'Legendary',unlock:5},
 {sku:'mace-legendary',name:'Legendary Mace',cost:500,kind:'equipment',category:'Mace',rarity:'Legendary',unlock:5},
 {sku:'staff-legendary',name:'Legendary Staff',cost:400,kind:'equipment',category:'Staff',rarity:'Legendary',unlock:5},
 {sku:'shield-common',name:'Common Shield',cost:35,kind:'equipment',category:'Shield',rarity:'Common'},
 {sku:'shield-uncommon',name:'Uncommon Shield',cost:95,kind:'equipment',category:'Shield',rarity:'Uncommon',unlock:2},
 {sku:'shield-rare',name:'Rare Shield',cost:170,kind:'equipment',category:'Shield',rarity:'Rare',unlock:4},
 {sku:'shield-legendary',name:'Legendary Shield',cost:400,kind:'equipment',category:'Shield',rarity:'Legendary',unlock:5},
 {sku:'shield-mythic',name:'Mythic Shield',cost:900,kind:'equipment',category:'Shield',rarity:'Mythic',unlock:10},
 {sku:'shield-exotic',name:'Exotic Shield',cost:3000,kind:'equipment',category:'Shield',rarity:'Exotic',unlock:13},
 {sku:'blast-bomb',name:'💣 Blast Bomb',cost:45,kind:'consumable',effect:'bomb',description:'Once per battle turn: attacks enemies within 3 squares, respecting walls.'},
 {sku:'meteor-scroll',name:'☄️ Meteor Scroll',cost:120,kind:'consumable',effect:'meteor',description:'Once per battle turn: light damage to every living enemy in the room.'},
 {sku:'guardian-ward',name:'🔰 Guardian Tonic',cost:35,kind:'consumable',effect:'ward',description:'Heal 35% maximum HP and block the next enemy strike.'},
 {sku:'super-potion',name:'⚡ Superstrength Potion',cost:150,kind:'consumable',effect:'super',description:'Double attack and defence dice for this room only.'}
];
const LEGENDARY_SHOP=SHOP_STOCK.filter(item=>item.rarity==='Legendary'&&item.unlock<=5&&['Sword','Bow','Mace','Staff'].includes(item.category));
const MYTHIC_SHOP=SHOP_STOCK.filter(item=>item.rarity==='Mythic');
const EXOTIC_SHOP=SHOP_STOCK.filter(item=>item.rarity==='Exotic');
// ONE 5%-chance offer per completed boss at Medium access, not 5% per displayed weapon.
// Reopening the merchant does not reroll the offer. A successful offer is single-stock.
export function refreshMerchant(s,random=Math.random){
 s.legendaryMerchantOffer=null;
 s.mythicMerchantOffer=null;
 s.exoticMerchantOffer=null;
 if((s.unlockedQuest||1)>=13){
  if(random()<.05){const offer=EXOTIC_SHOP[Math.min(EXOTIC_SHOP.length-1,Math.floor(random()*EXOTIC_SHOP.length))];s.exoticMerchantOffer={sku:offer.sku,remaining:1};}
  return;
 }
 if((s.unlockedQuest||1)>=10){
  if(random()<.05){const offer=MYTHIC_SHOP[Math.min(MYTHIC_SHOP.length-1,Math.floor(random()*MYTHIC_SHOP.length))];s.mythicMerchantOffer={sku:offer.sku,remaining:1};}
  return;
 }
 if((s.unlockedQuest||1)<5)return;
 if(random()<MEDIUM_LEGENDARY_CHANCE){
   const offer=LEGENDARY_SHOP[Math.min(LEGENDARY_SHOP.length-1,Math.floor(random()*LEGENDARY_SHOP.length))];
   s.legendaryMerchantOffer={sku:offer.sku,remaining:1};
 }
}
export function merchantStock(s,viewerId=null){const tier=viewerId&&s.players?.[viewerId]?unlockedQuestCeiling(s.players[viewerId].completedQuests):s.unlockedQuest||1;return SHOP_STOCK.filter(item=>{if((item.unlock||1)>tier)return false;if(item.kind!=='equipment')return true;if(tier>=13){if(!['Legendary','Mythic','Exotic'].includes(item.rarity))return false;if(item.rarity==='Exotic')return s.exoticMerchantOffer?.sku===item.sku&&s.exoticMerchantOffer.remaining>0;return true;}if(tier>=10){if(['Common','Uncommon'].includes(item.rarity))return false;if(item.rarity==='Mythic')return s.mythicMerchantOffer?.sku===item.sku&&s.mythicMerchantOffer.remaining>0;return true;}return item.rarity!=='Legendary'||(s.legendaryMerchantOffer?.sku===item.sku&&s.legendaryMerchantOffer.remaining>0);});}
export function buyFromShop(s,id,sku,now=nowMs()){
 const p=readyPlayer(s,id);requireNoFight(s,p);
 if(p.room!=='camp')throw new Error('Visit the merchant in Adventurers’ Camp');
 const stock=SHOP_STOCK.find(x=>x.sku===sku);if(!stock)throw new Error('Unknown merchant item');
 const playerTier=unlockedQuestCeiling(p.completedQuests);
 if((stock.unlock||1)>playerTier)throw new Error('That stock is not unlocked yet');
 if(!merchantStock(s,id).some(item=>item.sku===stock.sku))throw new Error('This item is not stocked by the merchant right now');
 const cost=classPrice(p,stock,(s.cityDistricts||[]).includes('q12r2'));
 if(p.gold<cost)throw new Error('Not enough gold');
 p.gold-=cost;
 if(stock.rarity==='Legendary'&&playerTier<10)s.legendaryMerchantOffer.remaining--;
 if(stock.rarity==='Mythic'&&playerTier<13)s.mythicMerchantOffer.remaining--;
 if(stock.rarity==='Exotic')s.exoticMerchantOffer.remaining--;
 if(stock.kind==='potion')p.inventory.potions.push({id:itemId(p,'potion'),kind:'potion',name:'Healing Potion',charges:1});
 else if(stock.kind==='consumable')p.inventory.consumables.push({id:itemId(p,'consumable'),kind:'consumable',sku:stock.sku,effect:stock.effect,name:stock.name,charges:1});
 else p.inventory.equipment.push({id:itemId(p,'equipment'),kind:'equipment',category:stock.category,rarity:stock.rarity,level:p.level,bonusDie:RARITY_DICE[stock.rarity],name:stock.name+' · L'+p.level,enchantments:[]});
 addLog(s,`${p.name} bought ${stock.name} for ${cost} gold.`,now);s.revision++;return {saved:'merchant'};
}
/** Merchant buyback prices: generally half of equivalent shop price, never
 * reclaim an enchantment once it is permanently bound. Training gear has no resale value. */
export function resaleValue(item){
 if(!item||item.training)return 0;
 if(item.kind==='equipment'){
  const base=SHOP_STOCK.find(x=>x.kind==='equipment'&&x.category===item.category&&x.rarity===item.rarity)?.cost
     ?? ({Sword:{Legendary:400,Mythic:900,Exotic:3000},Mace:{Legendary:500,Mythic:1200,Exotic:4000},Staff:{Rare:180,Legendary:400,Mythic:1000,Exotic:3200},Bow:{Rare:170,Legendary:400,Mythic:900,Exotic:3000},Armour:{Rare:170,Legendary:400,Mythic:900,Exotic:3000}}[item.category]?.[item.rarity]||0);
  return Math.floor(base*.5);
 }
 if(item.kind==='potion')return Math.floor((Math.min(2,Math.max(0,item.charges||0)))*5);
 if(item.kind==='consumable')return Math.floor((SHOP_STOCK.find(x=>x.sku===item.sku)?.cost||0)*.5);
 if(item.kind==='enchantment')return Math.floor((20+10*Math.max(1,Math.min(5,item.level||1)))*.5);
 return 0;
}
/** All item transfers and gold grants happen atomically in the Durable Object. */
export function sellToShop(s,id,kind,itemIdValue,now=nowMs()){
 const p=readyPlayer(s,id);requireNoFight(s,p);
 if(p.room!=='camp')throw new Error('Only the camp merchant buys items');
 if(!['equipment','potions','enchantments','consumables'].includes(kind))throw new Error('Unknown item category');
 const items=p.inventory[kind]||[];
 const index=items.findIndex(x=>x.id===itemIdValue);
 if(index<0)throw new Error('You do not own that item');
 const item=items[index],price=resaleValue(item);
 if(price<=0)throw new Error(item.training?'Training equipment cannot be sold':'This item has no resale value');
 items.splice(index,1);
 for(const slot of ['weapon','offhand','armour'])if(p.equipped[slot]===item.id)p.equipped[slot]=null;
 p.gold+=price;
 addLog(s,`${p.name} sold ${item.name} for ${price} gold${item.enchantments?.length?' (bound enchantments included)':''}.`,now);
 s.revision++;return {saved:'merchant',price};
}

/** Explicit LAB RESET only. Replaces the three test rooms and personal test loot,
 * but preserves active websocket identities/names. Not for production characters.
 */
export function resetTestAdventure(old,now=nowMs()){
  const fresh=freshState(now);
  fresh.balanceTrial=!!old.balanceTrial;
  for(const [id,p] of Object.entries(old.players)){
    ensurePlayer(fresh,id,p.name);
    fresh.players[id].connected=!!p.connected;
  }
  fresh.revision=old.revision+1;
  addLog(fresh,'LAB RESET: Fresh enemies and four personal treasure searches per room are ready.',now);
  return fresh;
}

const safeName=(name)=>String(name||'Adventurer').slice(0,28);
export const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const clone=(x)=>structuredClone(x);
export function freshState(now=nowMs()){
  const rooms={};
  for(const [id,def] of Object.entries(ROOM_DATA)){
    rooms[id]={id,discovered:id==='woodland',battle:{status:def.encounter.length?'dormant':'none',round:0,deadline:null,actions:{},eligibleRound:{},enemies:[]}};
  }
  return {turn:{round:1,ended:{},eligibleRound:{},deadline:now+ROUND_MS},version:8,progressionVersion:2,epoch:now,revision:0,unlockedQuest:1,completedQuests:[],questRewardOffers:{},questRewardClaimed:{},legendaryMerchantOffer:null,mythicMerchantOffer:null,exoticMerchantOffer:null,events:[],nextEventId:1,players:{},rooms,log:[{at:now,text:'A Roll in the Woods begins. Find your friends and explore.'}]};
}
function addLog(s,text,now){s.log.push({at:now,text});if(s.log.length>35)s.log=s.log.slice(-35)}
function emitEvent(s,type,payload,at){s.events??=[];s.nextEventId??=1;s.events.push({id:s.nextEventId++,type,...payload,at});s.events=s.events.slice(-40)}
export function ensureWorld(s){
  s.rooms??={};s.events??=[];s.nextEventId??=1;
  s.legendaryMerchantOffer??=null;s.mythicMerchantOffer??=null;s.exoticMerchantOffer??=null;
  if(!s.turn){
    // Save migration: retain player progress and enemies, but start a clean
    // global turn to prevent old room-local turn owners from conflicting.
    s.turn={round:1,ended:{},eligibleRound:{},deadline:nowMs()+ROUND_MS};
    for(const id of Object.keys(s.players||{}))s.turn.eligibleRound[id]=1;
    for(const room of Object.values(s.rooms)){const b=room.battle;
      if(b?.status==='active'){b.round=1;b.actions={};b.turnEnded={};b.deadline=null;
        b.eligibleRound=Object.fromEntries(Object.keys(s.players||{}).filter(id=>s.players[id].room===room.id).map(id=>[id,1]));}
    }
    for(const player of Object.values(s.players||{})){player.moveRemaining=0;player.moveRound=null;player.movementRolled=false;}
  }
  s.turn.ended??={};s.turn.eligibleRound??={};
  for(const [id,def] of Object.entries(ROOM_DATA)){
    if(!s.rooms[id])s.rooms[id]={id,discovered:id==='woodland',battle:{status:def.encounter.length?'dormant':'none',round:0,deadline:null,actions:{},eligibleRound:{},enemies:[]}};
    else {const b=s.rooms[id].battle;b.wave??=0;b.participated??={};b.damageBy??={};b.turnEnded??={};}
  }
  s.completedQuests??=[];s.questRewardOffers??={};s.questRewardClaimed??={};
  // Preserve old lab success: a cleared Watchpost unlocks Quest 2 on migration.
  if(s.rooms.watchpost?.battle.status==='cleared'&&!s.completedQuests.includes(1))s.completedQuests.push(1);
  for(const q of [2,3,4,5,6,7,8,9,10,11,12,13,14,15]){
    const final=Object.entries(ROOM_DATA).find(([id,meta])=>meta.quest===q&&meta.final)?.[0];
    if(final&&s.rooms[final]?.battle.status==='cleared'&&!s.completedQuests.includes(q))s.completedQuests.push(q);
  }
  // Existing V1 saves used a shared sequential unlock counter. Migrate it once,
  // granting existing characters their earned prior access without changing
  // levels, gear, bookmarks or saves. A NEW player joining after migration
  // starts their own Beginner progression rather than inheriting world credit.
  if(s.progressionVersion!==2){
    const legacyCompleted=migrateLegacyCompletions(s.completedQuests,s.unlockedQuest);
    for(const p of Object.values(s.players||{})){
      p.completedQuests=normalizedCompletions(p.completedQuests??legacyCompleted);
      p.unlockedQuest=unlockedQuestCeiling(p.completedQuests);
    }
    s.completedQuests=legacyCompleted;
    s.progressionVersion=2;
  }
  s.completedQuests=normalizedCompletions(s.completedQuests);
  s.unlockedQuest=unlockedQuestCeiling(s.completedQuests);
  for(const p of Object.values(s.players||{})){
    if(!Array.isArray(p.completedQuests))p.completedQuests=[];
    p.completedQuests=normalizedCompletions(p.completedQuests);
    p.unlockedQuest=unlockedQuestCeiling(p.completedQuests);
  }
}
/** Remember the last SAFE square in each quest; this is per-player and
 * survives camp visits, quest switching and browser reconnects. */
function saveQuestBookmark(p){
 const quest=ROOM_DATA[p.room]?.quest;
 if(quest>0){p.questBookmarks??={};p.questBookmarks[quest]={room:p.room,x:p.x,y:p.y};p.lastCampQuest=quest;}
}
function activeBookmark(s,p,quest){
 const point=p.questBookmarks?.[quest];
 return point&&ROOM_DATA[point.room]?.quest===quest&&s.rooms[point.room]?point:null;
}
/** Returns to the saved room without respawning an encounter or resetting loot. */
export function resumeQuest(s,id,now=nowMs()){
 const p=readyPlayer(s,id);ensureWorld(s);
 if(p.room!=='camp')throw new Error('Return to camp before resuming a quest');
 const quest=p.lastCampQuest;
 if(!questIsUnlocked(p.completedQuests,quest))throw new Error('No unfinished quest to resume');
 return enterQuest(s,id,quest,now);
}
/** Move to the entrance of an unlocked quest. The lab keeps previously cleared rooms
 * and per-character pickups; only a quiet (non-combat) room permits travel.
 */
export function enterQuest(s,id,quest,now=nowMs()){
  const p=readyPlayer(s,id);
  ensureWorld(s);
  if(!questIsUnlocked(p.completedQuests,quest))throw new Error('This difficulty tier is not unlocked for this character');
  if(s.rooms[p.room].battle.status==='active')throw new Error('Cannot change quests during combat');
  if(p.hp<=0)throw new Error('Downed players cannot travel to another quest');
  if(p.room!=='camp'&&ROOM_DATA[p.room]?.quest!==quest)saveQuestBookmark(p);
  const bookmark=activeBookmark(s,p,quest);
  const start=bookmark?.room||Object.keys(ROOM_DATA).find(r=>ROOM_DATA[r].quest===quest);
  const entry=nearestVacant(s,start,bookmark?.x??1,bookmark?.y??3,p.id);
  if(!entry)throw new Error('No free square in the saved quest room');
  p.room=start;p.x=entry.x;p.y=entry.y;p.moveRemaining=0;p.moveRound=null;p.movementRolled=false;
  p.lastCampQuest=quest;
  saveQuestBookmark(p);
  s.rooms[start].discovered=true;
  const alreadyActive=s.rooms[start].battle.status==='active';
  addLog(s,bookmark?`${p.name} resumed Quest ${quest} in ${ROOM_DATA[start].name}.`:`${p.name} entered Quest ${quest}: ${PLAYABLE_QUESTS[quest].name}.`,now);
  spawnEncounter(s,start,now);
  if(alreadyActive&&s.rooms[start].battle.status==='active'){
    // Late arrivals cannot take a past player's turn, but the current global
    // actor can participate immediately instead of becoming unable to End Turn.
    s.rooms[start].battle.eligibleRound[p.id]=globalActivePlayer(s)===id?s.turn.round:s.turn.round+1;
  }
  s.revision++;return {saved:'room-entry'};
}
/** Individual exit; no party-wide vote, no stationary blocker. */
export function voteFinishQuest(s,id,now=nowMs()){
 const p=readyPlayer(s,id),def=ROOM_DATA[p.room];
 if(!def.final||s.rooms[p.room].battle.status!=='cleared')throw new Error('Defeat this quest boss before leaving');
 if(Math.abs(p.x-(roomSize(p.room).width-1))+Math.abs(p.y-doorRow(p.room))>1)throw new Error('Stand next to the east exit to finish the quest');
 const landing=nearestVacant(s,'camp',1,3,p.id);
 if(!landing)throw new Error('The camp is full');
 p.room='camp';p.x=landing.x;p.y=landing.y;
 p.moveRemaining=0;p.moveRound=null;p.movementRolled=false;
  // A player joining after the shared boss was defeated can still earn their
  // own quest credit by reaching the cleared final exit. Otherwise new players
  // would be unable to progress through a world with already-cleared bosses.
  const before=unlockedQuestCeiling(p.completedQuests);
  if(!p.completedQuests.includes(def.quest))p.completedQuests.push(def.quest);
  p.completedQuests=normalizedCompletions(p.completedQuests);
  p.unlockedQuest=unlockedQuestCeiling(p.completedQuests);
  if(p.unlockedQuest>before)addLog(s,`${p.name} unlocked all quests in ${QUEST_TIERS.find(t=>t.max===p.unlockedQuest)?.name||'the next difficulty'} difficulty.`,now);
  delete p.questBookmarks?.[def.quest];if(p.lastCampQuest===def.quest)p.lastCampQuest=null;
 s.rooms.camp.discovered=true;
 addLog(s,`${p.name} finished Quest ${def.quest} and returned to the camp merchant.`,now);
 emitEvent(s,'return-camp',{quest:def.quest,players:[id]},now);
 s.revision++;return {saved:'quest-exit'};
}
/** Camp visits are independent outside active combat; the player may shop
 * or choose a different unlocked quest without moving their teammates. */
export function returnToCamp(s,id,now=nowMs()){
 const p=readyPlayer(s,id);requireNoFight(s,p);
 if(p.room==='camp')return {saved:null};
 if(p.hp<=0)throw new Error('Downed adventurers cannot return to camp');
 const from=p.room,landing=nearestVacant(s,'camp',1,3,p.id);
 if(!landing)throw new Error('The camp is full');
 saveQuestBookmark(p);
 p.room='camp';p.x=landing.x;p.y=landing.y;
 p.moveRemaining=0;p.moveRound=null;p.movementRolled=false;
 s.rooms.camp.discovered=true;
 addLog(s,`${p.name} returned from ${ROOM_DATA[from].name} to camp.`,now);
 s.revision++;return {saved:'room-entry'};
}
/** Replay is explicit and only available when all players have left that quest.
 * Unlocks and player progress persist; encounters and personal room treasure reset.
 */
export function replayQuest(s,id,quest,now=nowMs()){
 const p=readyPlayer(s,id);ensureWorld(s);requireNoFight(s,p);
 if(!p.completedQuests.includes(quest)||!Number.isInteger(quest)||quest<1||quest>15)throw new Error('Finish this quest before replaying it');
 const rooms=Object.keys(ROOM_DATA).filter(r=>ROOM_DATA[r].quest===quest);
 if(Object.values(s.players).some(hero=>rooms.includes(hero.room)))throw new Error('All adventurers must leave this quest before it can be replayed');
 for(const player of Object.values(s.players)){delete player.questBookmarks?.[quest];if(player.lastCampQuest===quest)player.lastCampQuest=null;}
 for(const roomId of rooms){
  const r=s.rooms[roomId];r.discovered=false;
  r.battle={status:ROOM_DATA[roomId].foes.length?'dormant':'none',round:0,deadline:null,actions:{},eligibleRound:{},enemies:[],wave:0,participated:{},damageBy:{},exitVotes:{}};
  for(const hero of Object.values(s.players))if(hero.lootClaimed)delete hero.lootClaimed[roomId];
 }
 addLog(s,`Quest ${quest} replay started. Rooms and personal discoveries refreshed, but progress and equipment are retained.`,now);
 return enterQuest(s,id,quest,now);
}
/** Confirm a class once. A legacy character may migrate at camp without
 * forfeiting gear, gold, XP, level, quest access, or other characters' progress.
 * Server validation makes class choice immutable after confirmation. */
export function selectClass(s,id,klass,now=nowMs()){
 const p=readyPlayer(s,id);
 if(!Object.hasOwn(CLASS_DATA,klass))throw new Error('Choose Knight, Outlaw, Warlock or Tinker');
 if(p.classChosen)throw new Error('Character class has already been confirmed');
 if(p.mazeSlot||!['woodland','camp'].includes(p.room))throw new Error('Choose your class at camp or the initial Woodland Path');
 requireNoFight(s,p);
 const oldMax=p.maxHp,oldHp=p.hp;
 p.klass=klass;p.classChosen=true;
 p.maxHp=effectiveStats(p).maxHp;
 p.hp=oldHp<=0?0:Math.max(1,Math.min(p.maxHp,oldHp+p.maxHp-oldMax));
 // A thematic starter weapon, granted once per character. Existing progress
 // remains untouched; rare equipment is never gifted during a migration.
 const category=CLASS_DATA[klass].starter;
 const item={id:itemId(p,'equipment'),kind:'equipment',category,rarity:'Common',level:1,bonusDie:4,name:`Starter ${category} · ${CLASS_DATA[klass].label}`,enchantments:[],starter:true};
 p.inventory.equipment.push(item);
 if(!p.equipped.weapon)p.equipped.weapon=item.id;
 addLog(s,`${p.name} confirmed ${CLASS_DATA[klass].label} as their permanent character class.`,now);
 emitEvent(s,'class-choice',{player:id,klass},now);s.revision++;return {saved:'character-class'};
}

/** One-time player-facing registration, saved in the authoritative adventure.
 * Class and name persist through reconnects, local seat changes and the Maze.
 * Existing confirmed classes are retained during migration. */
export function createCharacter(s,id,name,klass,now=nowMs()){
 const p=readyPlayer(s,id);
 if(p.nameConfirmed)throw new Error('This character has already been registered');
 const clean=String(name||'').trim().replace(/\s+/g,' ');
 if(clean.length<2||clean.length>24||!/^[\p{L}\p{N}][\p{L}\p{N} .'-]*$/u.test(clean))
   throw new Error('Name must be 2–24 letters/numbers with optional spaces, hyphens or apostrophes');
 if(!Object.hasOwn(CLASS_DATA,klass))throw new Error('Choose a valid character class');
 if(p.classChosen&&p.klass!==klass)throw new Error('This character already has a permanent class');
 if(!p.classChosen)selectClass(s,id,klass,now);
 p.name=clean;p.nameConfirmed=true;
 addLog(s,`${p.name} registered as a ${CLASS_DATA[p.klass].label}.`,now);
 s.revision++;
 return {saved:'character-identity'};
}

export function ensurePlayer(s,id,name,role){
  if(!['one','two','three','four'].includes(id))throw new Error('Unrecognised player');
  ensureWorld(s);
  if(!s.players[id]){
    const klass=['one','three'].includes(id)?'knight':'outlaw';
    const entry={one:[1,3],two:[1,4],three:[1,2],four:[1,5]}[id];
    s.players[id]={id,name:safeName(name),klass,room:'woodland',x:entry[0],y:entry[1],hp:CLASS_DATA[klass].hp,maxHp:CLASS_DATA[klass].hp,connected:false,downedUntil:null};
  }
  ensureProgress(s.players[id]);
  const wasConnected=s.players[id].connected;
  const someoneWasOnline=Object.values(s.players).some(p=>p.connected);
  const current=globalActivePlayer(s);
  if(!s.players[id].nameConfirmed)s.players[id].name=safeName(name);
  s.players[id].connected=true;
  // A later login can participate immediately only if their numbered turn
  // has not already been passed. Rejoining cannot reopen a completed turn.
  if(!wasConnected){
    const passed=s.turn.ended[id]||current&&PLAYER_ORDER.indexOf(current)>PLAYER_ORDER.indexOf(id);
    s.turn.eligibleRound[id]=passed?s.turn.round+1:s.turn.round;
  }
  if(!someoneWasOnline)s.turn.deadline=nowMs()+ROUND_MS;
  // Repair persisted positions from earlier code versions on either reconnection.
  // Keep Player One in place where possible, relocate Player Two and enemies.
  reconcilePositions(s);
  // Repair a saved turn that was locked by the old room-entry wait rule.
  allowCurrentActorIntoBattle(s,s.players[id]);
  // Keep any XP and inventory already earned in older saved adventures.
  const maxHp=effectiveStats(s.players[id]).maxHp;
  if(s.players[id].maxHp!==maxHp){
    s.players[id].hp=Math.min(maxHp,Math.max(0,s.players[id].hp + (maxHp-s.players[id].maxHp)));
    s.players[id].maxHp=maxHp;
  }
  s.version=8;
  s.revision++;
  return s.players[id];
}
export function markDisconnected(s,id,now=nowMs()){
 if(!s.players[id])return;
 s.players[id].connected=false;s.revision++;
 if(!globalActivePlayer(s)&&Object.keys(s.turn?.ended||{}).length)
   return advanceGlobalRound(s,now);
 s.turn.deadline=globalActivePlayer(s)?now+ROUND_MS:null;
 return {saved:null};
}
function variantHp(faces,variant){return faces*(variant==='shiny'?2:variant==='large'?3:variant==='large-shiny'?6:1)}
function enemyFootprint(e){return e.variant==='large'||e.variant==='large-shiny'?2:1}
function enemyTiles(e){const tiles=[];for(let dx=0;dx<enemyFootprint(e);dx++)for(let dy=0;dy<enemyFootprint(e);dy++)tiles.push([e.x+dx,e.y+dy]);return tiles}
function actorDistance(p,e){const size=enemyFootprint(e);const dx=Math.max(e.x-p.x,0,p.x-(e.x+size-1));const dy=Math.max(e.y-p.y,0,p.y-(e.y+size-1));return dx+dy}
function enemyCanOccupy(s,roomId,e,x,y){
  const w=enemyFootprint(e);if(x<0||y<0||x+w>roomSize(roomId).width||y+w>roomSize(roomId).height)return false;
  for(let dx=0;dx<w;dx++)for(let dy=0;dy<w;dy++)if(isWall(roomId,x+dx,y+dy))return false;
  for(let dx=0;dx<w;dx++)for(let dy=0;dy<w;dy++)if(occupied(s,roomId,x+dx,y+dy,null,e.id))return false;
  return true;
}
function largeTerrainReachableFromEntrance(roomId){
  const {width,height}=roomSize(roomId),row=doorRow(roomId);
  const clear=(x,y)=>x>=0&&y>=0&&x+1<width&&y+1<height&&
    !isWall(roomId,x,y)&&!isWall(roomId,x+1,y)&&!isWall(roomId,x,y+1)&&!isWall(roomId,x+1,y+1);
  const starts=[[0,row-1],[0,row],[1,row-1],[1,row]].filter(([x,y])=>clear(x,y));
  const reached=new Set(starts.map(([x,y])=>`${x},${y}`));
  const q=[...starts];
  for(let i=0;i<q.length;i++){
    const [x,y]=q[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;
      if(!reached.has(key)&&clear(nx,ny)){reached.add(key);q.push([nx,ny])}
    }
  }
  return reached;
}
function spawnFoes(s,roomId,foes,now){
  const b=s.rooms[roomId].battle;
  for(const [i,foe] of foes.entries()){
    const variant=foe.variant||'normal',size=variant==='large'||variant==='large-shiny'?2:1;
    const role=foe.role||'normal',medium=ROOM_DATA[roomId].quest>=5;
    const baseHp=variantHp(foe.faces,variant)*(medium?(ROOM_DATA[roomId].quest>=10?(variant==='boss'?3.15:2.25):(variant==='boss'?3.0:2.05)):1);
    const armourBase=variant==='boss'||variant==='large-shiny'?8:variant==='large'?6:4;
    const enemy={id:`${roomId}-w${b.wave||0}-${i}`,name:`${variant==='boss'?'Boss ':variant==='normal'?'':variant==='large-shiny'?'Large Shiny ':variant==='shiny'?'Shiny ':'Large '}${role!=='normal'?(role[0].toUpperCase()+role.slice(1)+' '):''}D${foe.faces}`,faces:foe.faces,variant,role,hp:Math.round(baseHp),maxHp:Math.round(baseHp),atk:medium?Math.round((15+(ROOM_DATA[roomId].quest-5)*4+foe.faces*.45+(variant==='boss'?10:0)+(role==='ninja'||role==='ranged'?3:0)))*(size===2?2:1):Math.max(2,Math.round(foe.faces*2/3))*(size===2?2:1),armourDie:medium?Math.round(13+(ROOM_DATA[roomId].quest-5)*3+foe.faces*.20+(variant==='boss'?8:0)+(role==='armoured'?7:0)):armourBase+(role==='armoured'?3:0),x:5,y:3,revived:false,awaitRevival:0,clone:false,teleportPhase:0,clonePhase:0};
    let placed=false;
    const reachableLarge=size===2?largeTerrainReachableFromEntrance(roomId):null;
    // A room's formation changes its approach angles. Every candidate remains
    // server-validated: a large creature cannot clip through even one wall tile.
    const positions={
      stagger:[[9,2],[7,6],[10,4],[5,7],[11,1],[6,1],[11,7],[8,4]],
      island:[[10,4],[6,2],[9,7],[6,6],[11,1],[5,4],[10,2],[8,5]],
      flanks:[[10,1],[7,7],[10,7],[6,1],[11,4],[8,3],[5,6],[9,5]],
      guard:[[10,4],[8,3],[8,5],[11,2],[11,6],[6,6],[6,2],[9,7]],
      boss:[[9,4],[10,2],[10,6],[7,3],[7,5],[11,4],[5,1],[5,7]],
      centre:[[7,4],[9,3],[9,5],[6,2],[6,6],[11,4],[10,1],[10,7]],
      gate:[[9,4],[9,2],[9,6],[6,1],[6,7],[11,4],[7,3],[7,5]],
      rush:[[7,5],[10,1],[9,7],[6,4],[11,4],[8,2],[5,7],[10,5]],
      archers:[[10,2],[10,6],[11,4],[7,4],[7,2],[8,6],[11,1],[11,7]],
      shield:[[8,4],[10,2],[10,6],[7,2],[7,6],[11,4],[6,4],[11,1]],
      ghost:[[9,4],[10,6],[6,1],[8,7],[11,3],[5,5],[10,1],[7,3]]
    };
    const formation=ROOM_DATA[roomId].formation||'stagger';
    const plan=positions[formation]||positions.stagger;
    const [px,py]=plan[i%plan.length];
    const targetX=ROOM_DATA[roomId].quest>=10?Math.min(13,px+2):medium?px:Math.max(2,Math.round(px*8/12));
    const targetY=ROOM_DATA[roomId].quest>=10?py+1:medium?py:Math.min(5,Math.round(py*6/8));
    const candidates=ROOM_DATA[roomId].quest===1 ? [[5,3],[6,3],[5,2],[6,2],[4,2],[5,1],[6,5],[3,4],[3,1],[7,1],[1,1],[1,5]] : Array.from({length:roomSize(roomId).width*roomSize(roomId).height},(_,k)=>[k%roomSize(roomId).width,Math.floor(k/roomSize(roomId).width)]);
    if(ROOM_DATA[roomId].quest>1)candidates.sort(([ax,ay],[bx,by])=>{
      const score=(x,y)=>Math.abs(x-targetX)*3+Math.abs(y-targetY)*3+(x<=2?20:0);
      return score(ax,ay)-score(bx,by)||bx-ax||ay-by;
    });
    for(const [x,y] of candidates){
      if((!reachableLarge||reachableLarge.has(`${x},${y}`))&&enemyCanOccupy(s,roomId,enemy,x,y)){enemy.x=x;enemy.y=y;placed=true;break}
    }
    if(!placed){for(let y=0;y<roomSize(roomId).height&&!placed;y++)for(let x=0;x<roomSize(roomId).width&&!placed;x++)if((!reachableLarge||reachableLarge.has(`${x},${y}`))&&enemyCanOccupy(s,roomId,enemy,x,y)){enemy.x=x;enemy.y=y;placed=true;}}
    if(!placed)throw new Error('No room to summon enemy');
    b.enemies.push(enemy);
  }
  addLog(s,`${ROOM_DATA[roomId].name}: ${foes.map(f=>(f.variant&&f.variant!=='normal'?f.variant+' ':'')+(f.role&&f.role!=='normal'?f.role+' ':'')+'D'+f.faces).join(' and ')} attack!`,now);
}
function spawnEncounter(s,roomId,now){
  const b=s.rooms[roomId].battle;
  if(b.status!=='dormant')return;
  const def=ROOM_DATA[roomId];
  b.status='active';b.round=s.turn.round;b.actions={};b.eligibleRound={};b.participated={};b.damageBy={};b.exitVotes={};b.wave=0;b.turnEnded={};b.deadline=null;
  for(const p of Object.values(s.players).filter(p=>p.room===roomId))b.eligibleRound[p.id]=s.turn.round;
  b.enemies=[];b.litLanterns??=[];spawnFoes(s,roomId,def.foes,now);
  b.nests=[];b.nestQueue=[];b.nestSpawns=0;
  if(def.quest===9){
    // Exceptional double nest in the first two rooms: 1 in 256.
    const roomNo=Number(roomId.split('r')[1]);
    const count=roomNo<=2&&Math.random()<1/256?2:1;
    const candidates=[[5,2],[6,6],[4,6],[7,2],[5,6],[3,2],[8,6],[7,6],[6,2]];
    for(let i=0;i<count;i++){
      const place=candidates.find(([x,y])=>!isWall(roomId,x,y)&&!occupied(s,roomId,x,y)&&!b.nests.some(n=>n.x===x&&n.y===y));
      if(!place)throw new Error('No safe tile for Warrens nest');
      b.nests.push({id:`${roomId}-nest-${i+1}`,x:place[0],y:place[1],active:true});
    }
  }

}
function livingParticipants(s,roomId){return Object.values(s.players).filter(p=>p.connected&&p.room===roomId&&p.hp>0)}
function eligibleParticipants(s,roomId){const b=s.rooms[roomId].battle;return livingParticipants(s,roomId).filter(p=>(b.eligibleRound?.[p.id]??1)<=b.round)}
function needsAction(s,roomId){const b=s.rooms[roomId].battle;return eligibleParticipants(s,roomId).filter(p=>!b.actions[p.id])}
// Position checks belong to the authoritative server, not just the browser UI.
function occupied(s,roomId,x,y,ignorePlayer=null,ignoreEnemy=null){
  const player=Object.values(s.players).find(p=>p.id!==ignorePlayer&&p.room===roomId&&p.x===x&&p.y===y);
  if(player||isWall(roomId,x,y)||s.rooms[roomId]?.battle?.nests?.some(n=>n.active&&n.x===x&&n.y===y))return true;
  const battle=s.rooms[roomId].battle;
  return battle.status==='active'&&battle.enemies.some(e=>e.id!==ignoreEnemy&&e.hp>0&&enemyTiles(e).some(([xx,yy])=>xx===x&&yy===y));
}
function reconcilePositions(s){
  for(const roomId of ROOM_IDS){
    const reserved=new Set();
    const actors=[...Object.values(s.players).filter(p=>p.room===roomId).sort((a,b)=>a.id.localeCompare(b.id)),...(s.rooms[roomId].battle.enemies||[]).filter(e=>e.hp>0)];
    for(const actor of actors){
      const size=actor.variant?enemyFootprint(actor):1;
      const valid=(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x+size<=roomSize(roomId).width&&y+size<=roomSize(roomId).height&&Array.from({length:size*size},(_,i)=>[x+i%size,y+Math.floor(i/size)]).every(([xx,yy])=>!reserved.has(`${xx},${yy}`)&&(actor.role==='ghost'||!isWall(roomId,xx,yy))&&!s.rooms[roomId]?.battle?.nests?.some(n=>n.active&&n.x===xx&&n.y===yy));
      let {x,y}=actor;
      if(!valid(x,y)){
        const safe=[];for(let yy=0;yy<=roomSize(roomId).height-size;yy++)for(let xx=0;xx<=roomSize(roomId).width-size;xx++)if(valid(xx,yy))safe.push({x:xx,y:yy});
        safe.sort((a,b)=>dist(a,{x:Number.isFinite(x)?x:1,y:Number.isFinite(y)?y:3})-dist(b,{x:Number.isFinite(x)?x:1,y:Number.isFinite(y)?y:3}));
        if(!safe.length)throw new Error('Room has no available square');({x,y}=safe[0]);actor.x=x;actor.y=y;
      }
      for(let dy=0;dy<size;dy++)for(let dx=0;dx<size;dx++)reserved.add(`${x+dx},${y+dy}`);
    }
  }
}
function nearestVacant(s,roomId,x,y,ignorePlayer){
  const spots=[];
  for(let xx=0;xx<roomSize(roomId).width;xx++)for(let yy=0;yy<roomSize(roomId).height;yy++){
    if(!occupied(s,roomId,xx,yy,ignorePlayer))spots.push({x:xx,y:yy});
  }
  spots.sort((a,b)=>dist({x,y},a)-dist({x,y},b));
  return spots[0]||null;
}
function doorwayLanding(s,roomId,entryX){
  // Doorway arrivals must not materialise on an existing character.
  const inward=entryX===0?1:-1;
  const centre=doorRow(roomId);
  const preferred=[[entryX,centre],[entryX,centre+1],[entryX,centre-1],[entryX+inward,centre],[entryX+inward,centre+1],[entryX+inward,centre-1]];
  for(const [x,y] of preferred)if(!occupied(s,roomId,x,y))return {x,y};
  for(let x=0;x<roomSize(roomId).width;x++)for(let y=0;y<roomSize(roomId).height;y++)if(!occupied(s,roomId,x,y))return {x,y};
  throw new Error('No clear space to enter this room');
}
/** D6 movement is a separate tactical resource, not a replacement for the attack action.
 * A player rolls once per combat round; in exploration a new roll is available
 * after spending the previous allocation. Rounds resolve together as before.
 */
export function applyDeathPenalty(s,p,now=nowMs()){
 ensureProgress(p);const previous=p.level;
 p.level=Math.max(1,p.level-2);p.xp=0;
 const sacrificeSlot=['weapon','offhand','armour'].find(slot=>p.equipped[slot]);
 let sacrificed=null;
 if(sacrificeSlot){
  const lost=p.equipped[sacrificeSlot];
  sacrificed=p.inventory.equipment.find(item=>item.id===lost)?.name||null;
  p.inventory.equipment=p.inventory.equipment.filter(item=>item.id!==lost);p.equipped[sacrificeSlot]=null;
 }
 const debt=Math.round(40*Math.pow(1.5,Math.max(0,previous-1))*.5);
 p.gold=Math.max(0,p.gold-debt);
 p.maxHp=effectiveStats(p).maxHp;p.hp=Math.ceil(p.maxHp*.8);p.downedUntil=null;
 p.moveRemaining=0;p.moveRound=null;p.movementRolled=false;
 addLog(s,`${p.name} falls from Level ${previous} to ${p.level}; lost ${debt} gold${sacrificed?' and '+sacrificed:''}. Restored to 80% HP.`,now);
 emitEvent(s,'death',{player:p.id,level:p.level,lost:sacrificed,goldLost:debt},now);
}
/** The global turn owner may act in whichever room they currently occupy.
 * Legacy 'join the battle next round' data must never lock their movement,
 * combat action or End Turn after a doorway/quest transition. This remains
 * gated by the global turn owner; it grants no extra roll or action. */
function allowCurrentActorIntoBattle(s,p){
 const battle=s.rooms[p.room]?.battle;
 if(battle?.status!=='active'||globalActivePlayer(s)!==p.id)return;
 battle.eligibleRound??={};
 if((battle.eligibleRound[p.id]??Infinity)>s.turn.round)
   battle.eligibleRound[p.id]=s.turn.round;
}
/** Every connected adventurer gets EXACTLY one D6 movement roll on their
 * global turn. Room and quest transitions do not grant a second roll. */
export function rollMovement(s,id,now=nowMs(),random=Math.random){
 const p=readyPlayer(s,id);
 assertGlobalTurn(s,id);
 if(p.lastRolledTurn===s.turn.round)throw new Error('Already rolled this turn');
  p.moveRound=`global:${s.turn.round}`;p.lastRolledTurn=s.turn.round;
 p.moveRemaining=rollDie(6,random);p.movementRolled=true;
 addLog(s,`${p.name} rolled D6 movement: ${p.moveRemaining} spaces (round ${s.turn.round}).`,now);
 s.revision++;return {saved:null,roll:p.moveRemaining};
}

export function move(s,id,dir,now=nowMs()){
  const p=s.players[id];if(!p||!p.connected)throw new Error('Player is not connected');
  if(p.hp<=0)throw new Error('You are down; a friend must revive you');
  if(!directions[dir])throw new Error('Unknown direction');
  assertGlobalTurn(s,id);
  allowCurrentActorIntoBattle(s,p);
  if(p.moveRound!==`global:${s.turn.round}`||!p.movementRolled)throw new Error('Roll D6 movement before moving');
  const b=s.rooms[p.room].battle;
  if(b.status==='active'){
    if(b.actions[id])throw new Error('Your action is already queued this round');
    if((b.eligibleRound?.[id]??s.turn.round)>s.turn.round)throw new Error('You join this fight next round');
    if(p.moveRemaining<=0)throw new Error('No movement points remain this round');
    const prior={x:p.x,y:p.y,room:p.room};const result=moveInCombat(s,p,dir,now);
    if(prior.room!==p.room||prior.x!==p.x||prior.y!==p.y){p.moveRemaining--;s.revision++;}
    return {saved:result||null};
  }
  if(p.moveRemaining<=0)throw new Error('No movement points remain this round');
  const [dx,dy]=directions[dir];const nx=p.x+dx,ny=p.y+dy;
  if(ny<0||ny>=roomSize(p.room).height)throw new Error('A wall blocks your path');
  if(nx<0||nx>=roomSize(p.room).width){
    const oldRoom=p.room;
    const def=ROOM_DATA[p.room];
    if(nx>=roomSize(p.room).width&&def.final&&s.rooms[p.room].battle.status==='cleared'&&p.y===doorRow(p.room)){
      return voteFinishQuest(s,id,now);
    }
    const next=nx<0?def.left:def.right;
    if(!next||p.y!==doorRow(p.room))throw new Error('The door is at the middle of the wall');
    const landing=doorwayLanding(s,next,nx<0?roomSize(next).width-1:0);
    p.room=next;p.x=landing.x;p.y=landing.y;p.moveRemaining=Math.max(0,p.moveRemaining-1);
    // Fallen companions who missed their rescue window can rejoin on the next
    // room (Decision 4); this tiny Quest 1 slice uses the following doorway.
    for(const q of Object.values(s.players).filter(q=>q.room===oldRoom&&q.hp===0&&q.downedUntil===null)){
      const safe=nearestVacant(s,next,p.x,4,q.id);
      if(!safe)throw new Error('No clear space for a returning teammate');
      q.room=next;q.x=safe.x;q.y=safe.y;applyDeathPenalty(s,q,now);
      addLog(s,`${q.name} returns to the party in the next room.`,now);
    }
    s.rooms[next].discovered=true;
    addLog(s,`${p.name} entered ${ROOM_DATA[next].name}.`,now);
    spawnEncounter(s,next,now);
    if(s.rooms[next].battle.status==='active'){
      // This player already owns the current GLOBAL turn. Door entry is not
      // a new player turn, so keep their remaining steps and action available.
      allowCurrentActorIntoBattle(s,p);
    }
    s.revision++;return {saved:'room-entry'};
  }
  if(occupied(s,p.room,nx,ny,id))throw new Error(isWall(p.room,nx,ny)?'A stone wall blocks that square':'That square is occupied');
  p.x=nx;p.y=ny;p.moveRemaining--;s.revision++;return {saved:null};
}
export function submitAction(s,id,action,now=nowMs(),deferResolution=false){
  const p=s.players[id];if(!p||!p.connected)throw new Error('Player is not connected');
  if(!action||!['attack','special','defend','move','revive','potion','item','nest','light'].includes(action.type))throw new Error('Invalid combat action');
  const b=s.rooms[p.room].battle;
  if(b.status!=='active')throw new Error('There is no active fight in this room');
  if(p.hp<=0)throw new Error('You are down');
  if((b.eligibleRound?.[id]??1)>b.round)throw new Error('You can join the fight next round');
  if(b.actions[id])throw new Error('Action already locked for this round');
  if(action.type==='move'&&!directions[action.dir])throw new Error('Invalid move');
  if(action.type==='potion'){
    ensureProgress(p);potionTarget(s,p,action.target||id);
    if(!p.inventory.potions.some(x=>x.charges>0))throw new Error('No healing potions available');
  }
  if(action.type==='item'){
    if(typeof action.sku!=='string'||!['blast-bomb','meteor-scroll','guardian-ward','super-potion'].includes(action.sku))throw new Error('Unknown combat consumable');
    ensureProgress(p);
    if(!p.inventory.consumables.some(x=>x.sku===action.sku&&x.charges>0))throw new Error('You do not own that consumable');
  }
  if(action.type==='nest'){
    if(ROOM_DATA[p.room].quest!==9)throw new Error('There are no nests in this room');
    const targets=(b.nests||[]).filter(n=>n.active&&Math.abs(n.x-p.x)+Math.abs(n.y-p.y)===1);
    if(!targets.length)throw new Error('Stand beside an active nest to disable it');
    if(action.target&&!targets.some(n=>n.id===action.target))throw new Error('That nest is not adjacent');
    action.target=(targets.find(n=>n.id===action.target)||targets[0]).id;
  }
  if(action.type==='light'){
    if(ROOM_DATA[p.room].quest!==14)throw new Error('Lanterns are only found in the Abyss');
    const sites=ABYSS_LANTERNS[p.room]||[];
    const reachable=sites.findIndex(([x,y],i)=>!b.litLanterns?.includes(i)&&Math.abs(x-p.x)+Math.abs(y-p.y)<=1);
    if(reachable<0)throw new Error('Stand beside an unlit lantern');
    action.target=String(reachable);
  }
  if(['attack','special'].includes(action.type)){
    if(action.target!=null&&typeof action.target!=='string')throw new Error('Invalid enemy target');
    if(action.target&&!b.enemies.some(e=>e.id===action.target&&e.hp>0))throw new Error('Enemy not found');
    if(action.type==='special'){
      const special=effectiveStats(p).special;
      if(!special)throw new Error('A Legendary or stronger weapon is required');
      const last=p.specialUsedAt?.[equippedItem(p,'weapon')?.id];
      if(Number.isInteger(last) && (p.combatTurns||0)<last+special.cooldown)throw new Error('Special attack is recharging');
    }
  }
  b.actions[id]={type:action.type,dir:action.dir,target:action.target||id,sku:action.type==='item'?action.sku:undefined};
  // A submitted action (including healing, defence or moving tactically) is meaningful participation.
  b.participated??={};b.participated[id]=true;
  s.revision++;
  // Only resolve when all currently connected participants have submitted.
  if(!deferResolution&&needsAction(s,p.room).length===0)return resolveRound(s,p.room,now);
  return {saved:null};
}
function moveInCombat(s,p,dir,now){
  const [dx,dy]=directions[dir];const nx=p.x+dx,ny=p.y+dy;
  if(nx<0||nx>=roomSize(p.room).width||ny<0||ny>=roomSize(p.room).height){
    if(nx<0&&p.y===doorRow(p.room)&&ROOM_DATA[p.room].left){
      const previous=p.room;const next=ROOM_DATA[p.room].left;
      const landing=doorwayLanding(s,next,roomSize(next).width-1);
      p.room=next;p.x=landing.x;p.y=landing.y;
      addLog(s,`${p.name} retreated from ${ROOM_DATA[previous].name}.`,now);
      return 'room-entry';
    }
    addLog(s,`${p.name} could not move through the wall.`,now);return null;
  }
  if(occupied(s,p.room,nx,ny,p.id)){
    addLog(s,`${p.name} cannot move: that square is blocked.`,now);
    return null;
  }
  p.x=nx;p.y=ny;return null;
}
function nearestTarget(p,enemies,range,targetId){
  const inRange=enemies.filter(e=>e.hp>0&&actorDistance(p,e)<=range&&
    (actorDistance(p,e)<=1||enemyTiles(e).some(([x,y])=>clearLine(p.room,p.x,p.y,x,y))));
  return targetId?inRange.find(e=>e.id===targetId)||null:inRange.sort((a,b)=>dist(a,p)-dist(b,p))[0]||null;
}
function rollHeroDamage(p,enemy,random,s,now,{specialDice=null,bonusDie=0}={}){
  const stats=effectiveStats(p),distance=actorDistance(p,enemy);
  const mainCanReach=distance<=stats.mainRange,offCanReach=stats.offhand>0&&distance<=stats.offhandRange;
  if(!mainCanReach&&!offCanReach){addLog(s,`${p.name} cannot reach ${enemy.name} with either weapon.`,now);return;}
  if(distance>1&&!enemyTiles(enemy).some(([x,y])=>clearLine(p.room,p.x,p.y,x,y))){addLog(s,`${p.name}'s shot strikes a wall.`,now);return;}
  const atk=mainCanReach?(specialDice?specialDice.reduce((total,die)=>total+rollDie(die,random),0):rollDie(stats.attack,random)):0;
  const offhand=offCanReach?Math.ceil(rollDie(stats.offhand,random)/2):0;
  const extra=mainCanReach&&bonusDie?rollDie(bonusDie,random):0;
  const classExtra=mainCanReach&&classBonusAttackDie(p)?rollDie(classBonusAttackDie(p),random):0;
  const defence=rollDie(enemy.armourDie||4,random);
  const rawHit=Math.max(0,atk+offhand+extra+classExtra-defence);
  const hit=enemy.role==='armoured'?Math.max(1,rawHit-Math.max(2,Math.ceil(enemy.faces*.45))):rawHit;
  const before=enemy.hp;enemy.hp=Math.max(0,enemy.hp-hit);
  if(before>0&&enemy.hp===0&&enemy.role==='zombie'&&!enemy.revived)enemy.awaitRevival=2;
  const dealt=before-enemy.hp;
  const battle=s.rooms[p.room]?.battle;if(battle){battle.damageBy??={};battle.damageBy[p.id]=(battle.damageBy[p.id]||0)+dealt;}
  addLog(s,`${p.name} rolled ${mainCanReach?atk+' main':'no main in range'}${offCanReach?' +'+offhand+' half off-hand':''}${extra?' +'+extra+' bonus':''}${classExtra?' +'+classExtra+' class die':''} vs ${enemy.name} D${enemy.armourDie||4} defence (${defence}): ${before-enemy.hp} damage (${enemy.hp}/${enemy.maxHp} HP).`,now);
}
function heroStrike(p,enemies,action,now,s,random){
  const stats=effectiveStats(p);
  const target=nearestTarget(p,enemies,stats.range,action.target);
  if(!target){addLog(s,`${p.name} finds no enemy in range of either weapon.`,now);return;}
  const mainInRange=actorDistance(p,target)<=stats.mainRange;
  if(mainInRange&&stats.category==='Mace'){
    const targets=[target,...enemies.filter(e=>e!==target&&e.hp>0&&actorDistance(p,e)<=stats.mainRange&&actorDistance({...p,x:target.x,y:target.y},e)<=1).sort((a,b)=>actorDistance(p,a)-actorDistance(p,b))].slice(0,3);
    for(const e of targets)rollHeroDamage(p,e,random,s,now);
  }else if(mainInRange&&stats.category==='Bow'&&stats.multishot){
    const dx=Math.sign(target.x-p.x),dy=Math.sign(target.y-p.y);const aligned=dx===0||dy===0;
    const targets=aligned?enemies.filter(e=>e.hp>0&&(
      dx===0&&e.x===p.x&&Math.sign(e.y-p.y)===dy&&Math.abs(e.y-p.y)<=stats.mainRange ||
      dy===0&&e.y===p.y&&Math.sign(e.x-p.x)===dx&&Math.abs(e.x-p.x)<=stats.mainRange
    )).sort((a,b)=>actorDistance(p,a)-actorDistance(p,b)).slice(0,Math.max(1,stats.multishot)):[target];
    for(const e of targets)rollHeroDamage(p,e,random,s,now);
  }else rollHeroDamage(p,target,random,s,now);
}
function heroSpecial(p,enemies,action,b,now,s,random){
  const stats=effectiveStats(p),cfg=stats.special;
  if(!cfg){addLog(s,`${p.name} has no special move equipped.`,now);return;}
  const weapon=equippedItem(p,'weapon');
  const used=p.specialUsedAt?.[weapon.id];
  if(Number.isInteger(used)&&(p.combatTurns||0)<used+cfg.cooldown){addLog(s,`${p.name}'s special is still recharging.`,now);return;}
  const target=nearestTarget(p,enemies,stats.mainRange,action.target);
  if(!target){addLog(s,`${p.name} has no enemy in the main weapon special attack range.`,now);return;}
  let targets=[target];
  if(stats.category==='Bow'||stats.category==='Staff'){
    targets=[target,...enemies.filter(e=>e!==target&&e.hp>0&&actorDistance(p,e)<=stats.mainRange&&clearLine(p.room,p.x,p.y,e.x,e.y))
      .sort((a,b)=>actorDistance(p,a)-actorDistance(p,b))].slice(0,cfg.targets);
  }
  if(stats.category==='Mace'){
    // Legendary 4, Mythic 5, Exotic all enemies in the room.
    targets=stats.rarity==='Exotic'?enemies.filter(e=>e.hp>0):[
      target,...enemies.filter(e=>e!==target&&e.hp>0&&dist(e,target)<=2).sort((a,b)=>dist(a,target)-dist(b,target))
    ].slice(0,cfg.targets);
  }
  for(const e of targets)rollHeroDamage(p,e,random,s,now,{specialDice:cfg.dice});
  p.specialUsedAt??={};p.specialUsedAt[weapon.id]=p.combatTurns||0;
  addLog(s,`${p.name} used ${stats.rarity} ${stats.category} SPECIAL on ${targets.length} target(s) · recharges in ${cfg.cooldown} rounds.`,now);
}
function useCombatConsumable(s,p,b,sku,now,random){
  ensureProgress(p);
  const index=p.inventory.consumables.findIndex(x=>x.sku===sku&&x.charges>0);
  if(index<0){addLog(s,`${p.name} no longer has that combat item.`,now);return}
  const item=p.inventory.consumables[index];
  const stats=effectiveStats(p);
  const live=b.enemies.filter(e=>e.hp>0);
  if(sku==='blast-bomb'&&!live.some(e=>actorDistance(p,e)<=3&&enemyTiles(e).some(([x,y])=>clearLine(p.room,p.x,p.y,x,y)))){
    addLog(s,`${p.name} has no enemy within blast range.`,now);return;
  }
  if(sku==='meteor-scroll'&&!live.length)return;
  if(sku==='guardian-ward'&&p.hp>=p.maxHp&&p.wardCharges>0){addLog(s,`${p.name} is already fully protected and healthy.`,now);return;}
  if(sku==='super-potion'&&p.superRoom===p.room){addLog(s,`${p.name} already has superstrength in this room.`,now);return;}
  // Consume when resolving an eligible, useful combat action, not on button press.
  p.inventory.consumables.splice(index,1);
  if(sku==='guardian-ward'){
    const gain=Math.min(p.maxHp-p.hp,Math.ceil(p.maxHp*.35));
    p.hp+=gain;p.wardCharges=1;
    addLog(s,`${p.name} used Guardian Tonic: +${gain} HP and a ward blocking the next enemy strike.`,now);
  }else if(sku==='super-potion'){
    p.superRoom=p.room;
    addLog(s,`${p.name} used Superstrength Potion: attack and armour dice doubled for this room.`,now);
  }else{
    const targets=sku==='meteor-scroll'?live:live.filter(e=>actorDistance(p,e)<=3&&enemyTiles(e).some(([x,y])=>clearLine(p.room,p.x,p.y,x,y)));
    let dealtTotal=0;
    for(const e of targets){
      const before=e.hp;
      let hit;
      if(sku==='blast-bomb'){
        const rolled=rollDie(Math.max(4,stats.attack),random)+(classBombDie(p,sku)?rollDie(classBombDie(p,sku),random):0);
        const armour=rollDie(e.armourDie||4,random);
        hit=Math.max(1,rolled-armour);
      }else hit=rollDie(Math.max(3,Math.ceil(stats.attack*.35)),random)+(classBombDie(p,sku)?rollDie(classBombDie(p,sku),random):0);
      if(e.role==='armoured')hit=Math.max(1,hit-Math.max(2,Math.ceil(e.faces*.3)));
      e.hp=Math.max(0,e.hp-hit);
      if(before>0&&e.hp===0&&e.role==='zombie'&&!e.revived)e.awaitRevival=2;
      dealtTotal+=before-e.hp;
    }
    b.damageBy??={};b.damageBy[p.id]=(b.damageBy[p.id]||0)+dealtTotal;
    addLog(s,`${p.name} used ${item.name} on ${targets.length} enemies (${dealtTotal} total damage).`,now);
  }
}
function applyHeroAction(s,p,a,b,now,random){
 const roomId=p.room;
 if(a.type==='move')moveInCombat(s,p,a.dir,now);
 else if(a.type==='attack')heroStrike(p,b.enemies,a,now,s,random);
 else if(a.type==='special')heroSpecial(p,b.enemies,a,b,now,s,random);
 else if(a.type==='item')useCombatConsumable(s,p,b,a.sku,now,random);
 else if(a.type==='nest'){
   const nest=(b.nests||[]).find(n=>n.id===a.target&&n.active);
   if(!nest||Math.abs(nest.x-p.x)+Math.abs(nest.y-p.y)!==1){addLog(s,'The nest is no longer within reach.',now);return;}
   const roll=rollDie(6,random);
   if(roll>=5){nest.active=false;addLog(s,`${p.name} rolled ${roll}: ${nest.id} disabled!`,now);emitEvent(s,'nest-disabled',{room:roomId,nest:nest.id},now);}
   else {const count=Math.min(8,Number(roomId.split('r')[1]));
     b.nestQueue??=[];b.nestQueue.push({x:nest.x,y:nest.y,count});
     addLog(s,`${p.name} rolled ${roll}: the nest erupts with ${count} fresh enemy dice after this enemy phase!`,now);
   }
 }
 else if(a.type==='light'){
   const index=Number(a.target),sites=ABYSS_LANTERNS[roomId]||[];
   b.litLanterns??=[];
   if(sites[index]&&!b.litLanterns.includes(index)&&Math.abs(sites[index][0]-p.x)+Math.abs(sites[index][1]-p.y)<=1){
     b.litLanterns.push(index);addLog(s,`${p.name} lights a lantern, driving back the shadows!`,now);
     emitEvent(s,'lantern-lit',{room:roomId,index},now);
   }
 }
 else if(a.type==='potion'){
   try{healWithPotion(s,p,a.target||p.id,now)}
   catch(err){addLog(s,`${p.name} could not use a potion: ${err.message}.`,now)}
 }else if(a.type==='revive'){
   const down=Object.values(s.players).find(q=>q.room===roomId&&q.hp===0&&dist(q,p)===1&&q.downedUntil>=b.round);
   if(down){down.hp=Math.ceil(down.maxHp/2);down.downedUntil=null;addLog(s,`${p.name} revives ${down.name} to ${down.hp} HP.`,now)}
   else addLog(s,`${p.name} finds nobody adjacent to revive.`,now);
 }
}
/** One shared player order, irrespective of quest, room, camp or combat. */
const PLAYER_ORDER=['one','two','three','four'];
export function globalActivePlayer(s){
 const turn=s.turn;if(!turn)return null;
 return PLAYER_ORDER.find(id=>s.players?.[id]?.connected&&!s.players[id].mazeSlot&&s.players[id].hp>0&&
   (turn.eligibleRound?.[id]??1)<=turn.round&&!turn.ended?.[id])||null;
}
// Legacy callers can ask for the global owner even when they are viewing a room.
export function activeTurnId(s,_roomId){return globalActivePlayer(s)}
export function assertGlobalTurn(s,id,{requireRoll=false}={}){
 const current=globalActivePlayer(s);
 if(current!==id)throw new Error('Waiting for '+(s.players[current]?.name||'the next round')+' to end their turn');
 if(requireRoll&&s.players[id].lastRolledTurn!==s.turn.round)
   throw new Error('Roll your movement D6 before choosing an action');
}
/** Queue at most one action, resolved on End Turn. */
export function submitSequentialAction(s,id,action,now=nowMs()){
 const p=readyPlayer(s,id);assertGlobalTurn(s,id,{requireRoll:true});
 allowCurrentActorIntoBattle(s,p);
 if(s.rooms[p.room].battle.status!=='active')throw new Error('No enemies to attack in this room');
 return submitAction(s,id,action,now,true);
}
/** End a global player turn; run ALL occupied encounters' enemy phases once
 * and only once, after the last eligible player finishes. */
export function endTurn(s,id,now=nowMs(),random=Math.random,{timeout=false}={}){
 const p=readyPlayer(s,id);assertGlobalTurn(s,id,{requireRoll:!timeout});
 allowCurrentActorIntoBattle(s,p);
 const b=s.rooms[p.room].battle;
 if(b.status==='active'&&(b.eligibleRound?.[id]??s.turn.round)<=s.turn.round){
   if(!b.actions[id])submitAction(s,id,{type:'defend'},now,true);
   const action=b.actions[id];
   if(!action.resolved){applyHeroAction(s,p,action,b,now,random);action.resolved=true;p.combatTurns=(p.combatTurns||0)+1;}
   b.turnEnded??={};b.turnEnded[id]=true;
 }
 s.turn.ended[id]=true;p.moveRemaining=0;
 addLog(s,`${p.name} ended turn ${s.turn.round}.`,now);
 if(globalActivePlayer(s)){
   s.turn.deadline=now+ROUND_MS;s.revision++;
   return {saved:null};
 }
 return advanceGlobalRound(s,now,random);
}
/** End each occupied room's encounter after every active player has finished. */
function advanceGlobalRound(s,now=nowMs(),random=Math.random){
const completed=[];
 for(const room of Object.values(s.rooms)){
   if(room.battle.status==='active')completed.push(resolveRound(s,room.id,now,random));
 }
 s.turn.round++;s.turn.ended={};s.turn.deadline=now+ROUND_MS;
 for(const hero of Object.values(s.players)){hero.moveRemaining=0;hero.moveRound=null;hero.movementRolled=false;}
 // A newly connected player marked for the next round can now take their turn.
 addLog(s,`Round ${s.turn.round} begins · ${PLAYER_ORDER.filter(x=>s.players[x]?.connected).map(id=>s.players[id].name).join(', ')||'waiting for players'}.`,now);
 s.revision++;
 return {saved:completed.map(r=>r.saved).find(Boolean)||null};
}
export function resolveRound(s,roomId,now=nowMs(),random=Math.random){
  const b=s.rooms[roomId].battle;
  if(b.status!=='active')return {saved:null};
  const group=eligibleParticipants(s,roomId);
  for(const p of group){
    const a=b.actions[p.id]||{type:'defend'};
    if(!a.resolved)applyHeroAction(s,p,a,b,now,random);
  }
  // Players who acted via End Turn already advanced their own cooldown.
  for(const p of group)if(!b.actions[p.id]?.resolved)p.combatTurns=(p.combatTurns||0)+1;
  if(b.enemies.every(e=>e.hp<=0&&!e.awaitRevival)&&!(b.nests||[]).some(n=>n.active)&&!(b.nestQueue||[]).length){
    const def=ROOM_DATA[roomId];
    // Quest 4's final room has two sequential waves: Large Shiny D4, then Boss D12.
    if(def.stageTwo&&b.wave===0){
      b.wave=1;b.enemies=[];spawnFoes(s,roomId,[{faces:12,variant:'boss'}],now);
      b.round++;b.actions={};b.turnEnded={};b.deadline=null;
      addLog(s,'The King’s Excavation trembles. The D12 BOSS emerges!',now);
      emitEvent(s,'boss-wave',{room:roomId},now);
      s.revision++;return {saved:null};
    }
    // Campaign XP: low early-quest totals, no runaway ×60 Large-Shiny/×5 stacking.
    const variantFactor=v=>v==='shiny'?1.5:v==='large'?1.75:v==='large-shiny'?2.25:v==='boss'?2:1;
    const roomXp=Math.max(6,Math.round((def.foes.reduce((sum,e)=>sum+e.faces*variantFactor(e.variant),0)+(def.stageTwo?24:0))*(def.quest>=5?1.6:2)));
    const participants=Object.keys(b.participated||{}).filter(id=>s.players[id]);
    const totalDamage=participants.reduce((sum,id)=>sum+(b.damageBy?.[id]||0),0);
    for(const id of participants){
      const player=s.players[id],damage=b.damageBy?.[id]||0;
      // A modest participation share for support players; most XP follows damage.
      const weight=totalDamage>0?(.2/participants.length)+(.8*damage/totalDamage):1/participants.length;
      let gain=Math.max(1,Math.round(roomXp*weight*.65));
      // Easy-quest farming is still possible, but increasingly ineffective.
      if(player.level>=def.quest+3)gain=Math.max(1,Math.floor(gain*.25));
      else if(player.level>=def.quest+2)gain=Math.max(1,Math.floor(gain*.5));
      awardXp(player,gain,s,now);
    }
    b.status='cleared';b.deadline=null;b.actions={};b.exitVotes={};
    addLog(s,`${ROOM_DATA[roomId].name} cleared!`,now);
    if(!def.final)emitEvent(s,'room-cleared',{room:roomId,name:ROOM_DATA[roomId].name},now);
    if(def.quest===12){
      s.cityDistricts??=[];
      if(!s.cityDistricts.includes(roomId)){
        s.cityDistricts.push(roomId);
        if(roomId==='q12r4')for(const player of Object.values(s.players)){if(player.hp>0&&player.room===roomId)player.hp=Math.min(player.maxHp,player.hp+Math.ceil(player.maxHp*.25));}
        if(roomId==='q12r3')for(const player of Object.values(s.players)){if(player.room===roomId)player.gold+=65;}
        addLog(s,`City district secured: ${def.name}${roomId==='q12r4'?' · temple healing':roomId==='q12r3'?' · warehouse supplies':''}.`,now);
      }
    }
    if(def.final){
      s.completedQuests??=[];if(!s.completedQuests.includes(def.quest))s.completedQuests.push(def.quest);
      const was=s.unlockedQuest||1;s.unlockedQuest=unlockedQuestCeiling(s.completedQuests);
      const unlockedFor={};
      // Credit only the characters who participated. Other players retain
      // individual progression, even when they share the same saved world.
      for(const id of Object.keys(b.participated||{}).filter(id=>s.players[id])){
        const hero=s.players[id],before=unlockedQuestCeiling(hero.completedQuests);
        hero.completedQuests=normalizedCompletions([...hero.completedQuests,def.quest]);
        hero.unlockedQuest=unlockedQuestCeiling(hero.completedQuests);
        if(hero.unlockedQuest>before){
          unlockedFor[id]=QUEST_TIERS.find(t=>t.max===hero.unlockedQuest)?.name||'next';
          addLog(s,`${hero.name} unlocked all quests in ${unlockedFor[id]} difficulty.`,now);
        }
      }
      // Tier transitions may now be triggered by ANY final quest in a tier,
      // not necessarily its highest-numbered quest. Preserve the established
      // rare-merchant reroll after eligible higher-tier bosses as well.
      const merchantTier=s.unlockedQuest||1;
      const eligibleBoss=def.quest>=(merchantTier>=13?12:merchantTier>=10?9:4);
      if((s.unlockedQuest>was&&merchantTier>=5)||eligibleBoss)refreshMerchant(s,random);
      addLog(s,`QUEST ${def.quest} COMPLETE!${s.unlockedQuest>was?' The next difficulty tier is now available to eligible heroes.':''}`,now);
      emitEvent(s,'quest-complete',{quest:def.quest,room:roomId,next:s.unlockedQuest>was?s.unlockedQuest:null,unlockedFor},now);
      for(const id of Object.keys(b.participated||{}).filter(id=>s.players[id])){
        const player=s.players[id];player.gold=(player.gold||0)+([0,12,22,35,50,65,80,95,115,135,170,210,260,330,420,600][def.quest]||0);
        awardXp(player,([0,10,18,24,32,40,46,52,60,66,85,100,120,145,180,240][def.quest]||0),s,now);
        // One new personal chest per quest per character. It is sealed when the
        // boss dies, rather than being rerolled when the UI is reopened.
        const rewardId=`${id}:${def.quest}`;
        if(!s.questRewardClaimed?.[rewardId]&&!s.questRewardOffers?.[rewardId]){
          const q=def.quest;const rarity=q<=1?'Common':q<=3?'Uncommon':q===4?'Rare':
            q<=9?(random()<.05?'Legendary':'Rare'):
            q<=12?(random()<.05?'Mythic':'Legendary'):(random()<.05?'Exotic':'Mythic');
          s.questRewardOffers[rewardId]={quest:q,rarity,level:player.level};
        }
      }
    }
    s.revision++;return {saved:def.final?'boss-completed':'checkpoint'};
  }
  if(ROOM_DATA[roomId].quest<=4){
  for(const e of b.enemies.filter(e=>e.hp>0)){
    const candidates=eligibleParticipants(s,roomId).sort((a,c)=>actorDistance(a,e)-actorDistance(c,e));
    if(!candidates.length)break;
    const target=candidates[0];
    if(actorDistance(target,e)>1){
      const candidate=[];
      if(target.x!==e.x)candidate.push([e.x+Math.sign(target.x-e.x),e.y]);
      if(target.y!==e.y)candidate.push([e.x,e.y+Math.sign(target.y-e.y)]);
      // Try legal lateral paths if direct move is obstructed by real walls.
      for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]])candidate.push([e.x+dx,e.y+dy]);
      const open=candidate.filter(([x,y])=>enemyCanOccupy(s,roomId,e,x,y));
      open.sort((a,c)=>actorDistance(target,{...e,x:a[0],y:a[1]})-actorDistance(target,{...e,x:c[0],y:c[1]}));
      const next=open.find(([x,y])=>actorDistance(target,{...e,x,y})<actorDistance(target,e));
      if(next){e.x=next[0];e.y=next[1]}
    }
    if(actorDistance(target,e)<=1){
      const defending=(b.actions[target.id]?.type||'defend')==='defend';
      const raw=rollDie(e.atk,random),blocked=rollDie(effectiveStats(target).armour,random)+(classBonusDefenceDie(target)?rollDie(classBonusDefenceDie(target),random):0);
      let hit=defending?Math.ceil(Math.max(0,raw-blocked)/2):Math.max(0,raw-blocked);
      if(target.wardCharges>0){target.wardCharges--;hit=0;addLog(s,`${target.name}'s Guardian Ward blocks the strike!`,now)}
      target.hp=Math.max(0,target.hp-hit);
      addLog(s,`${e.name} strikes ${target.name} for ${hit} damage (${target.hp}/${target.maxHp} HP).`,now);
      if(target.hp===0){target.downedUntil=b.round+3;addLog(s,`${target.name} is down! Three rounds to revive.`,now);emitEvent(s,'downed',{player:target.id},now)}
    }
  }
  }else{
  // Specialist enemy behaviours run only once, after all global player turns.
  // A room's own enemyPhase count is independent of players exploring other quests.
  b.enemyPhases=(b.enemyPhases||0)+1;
  const initialFoes=b.enemies.filter(e=>e.hp>0);
  if(roomId==='q15r15'){
    const king=b.enemies.find(e=>e.variant==='boss'&&e.hp>0);
    if(king){
      const phase=king.hp>king.maxHp*2/3?1:king.hp>king.maxHp/3?2:3;
      if(b.kingPhase!==phase){b.kingPhase=phase;king.role=['armoured','teleporter','ninja'][phase-1];
        king.name=`Dice King · Face ${phase} · D${king.faces}`;
        addLog(s,`The Dice King turns to FACE ${phase} — ${king.role.toUpperCase()}! Its health does not reset.`,now);}
    }
  }
  if(ROOM_DATA[roomId].quest===10&&ROOM_DATA[roomId].final){
    const king=initialFoes.find(e=>e.variant==='boss');
    if(king){
      const phases=['teleporter','armoured','ghost'];
      king.role=phases[(b.enemyPhases-1)%phases.length];
      king.name=`Chaos King · ${king.role} D${king.faces}`;
      if(b.enemyPhases%3===1)addLog(s,`The Chaos King changes form: ${king.role}!`,now);
    }
  }
  const heroTargets=()=>eligibleParticipants(s,roomId).filter(p=>p.hp>0);
  const canStrike=(foe,hero)=>hero&&actorDistance(hero,foe)<=(foe.role==='ranged'?2:1)
    &&(foe.role!=='ranged'||enemyTiles(foe).some(([x,y])=>clearLine(roomId,x,y,hero.x,hero.y)));
  const closeTo=(foe,hero,retreat=false)=>{
    if(!hero)return;
    const oldDistance=actorDistance(hero,foe);
    // Deterministic bounded shortest path prevents monsters repeatedly walking
    // into walls while keeping the 2x2 footprints and occupied squares legal.
    const passable=(x,y)=>{
      if(x<0||y<0||x+enemyFootprint(foe)>roomSize(roomId).width||y+enemyFootprint(foe)>roomSize(roomId).height)return false;
      if(foe.role!=='ghost')return enemyCanOccupy(s,roomId,foe,x,y);
      for(let dx=0;dx<enemyFootprint(foe);dx++)for(let dy=0;dy<enemyFootprint(foe);dy++){
        if(Object.values(s.players).some(p=>p.room===roomId&&p.x===x+dx&&p.y===y+dy))return false;
        if(b.enemies.some(other=>other.id!==foe.id&&other.hp>0&&enemyTiles(other).some(t=>t[0]===x+dx&&t[1]===y+dy)))return false;
      }return true;
    };
    if(retreat){const opts=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>[foe.x+dx,foe.y+dy]).filter(([x,y])=>passable(x,y));
      opts.sort((a,z)=>actorDistance(hero,{...foe,x:z[0],y:z[1]})-actorDistance(hero,{...foe,x:a[0],y:a[1]}));
      if(opts.length&&actorDistance(hero,{...foe,x:opts[0][0],y:opts[0][1]})>oldDistance){foe.x=opts[0][0];foe.y=opts[0][1]}return;}
    const queue=[[foe.x,foe.y]],seen=new Set([`${foe.x},${foe.y}`]),back=new Map();let destination=null;
    for(let idx=0;idx<queue.length;idx++){
      const [x,y]=queue[idx];const candidate={...foe,x,y};
      if(actorDistance(hero,candidate)<= (foe.role==='ranged'?2:1)&&
        (foe.role!=='ranged'||enemyTiles(candidate).some(([fx,fy])=>clearLine(roomId,fx,fy,hero.x,hero.y)))){destination=[x,y];break}
      for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
        const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;
        if(!seen.has(key)&&passable(nx,ny)){seen.add(key);back.set(key,[x,y]);queue.push([nx,ny])}
      }
    }
    if(!destination){ // No complete route: take reachable step closest to target.
      queue.sort((a,z)=>actorDistance(hero,{...foe,x:a[0],y:a[1]})-actorDistance(hero,{...foe,x:z[0],y:z[1]}));destination=queue[0];
    }
    const path=[];let key=`${destination[0]},${destination[1]}`;
    while(back.has(key)){path.push(destination);destination=back.get(key);key=`${destination[0]},${destination[1]}`}
    path.reverse();
    for(const [x,y] of path.slice(0,foe.role==='swift'?2:1)){foe.x=x;foe.y=y}
  };
  const strike=(foe,hero)=>{
    if(!canStrike(foe,hero))return false;
    const defending=(b.actions[hero.id]?.type||'defend')==='defend';
    const raw=rollDie(foe.atk,random),blocked=rollDie(effectiveStats(hero).armour,random)+(classBonusDefenceDie(hero)?rollDie(classBonusDefenceDie(hero),random):0);
    let hit=defending?Math.ceil(Math.max(0,raw-blocked)/2):Math.max(0,raw-blocked);
    if(hero.wardCharges>0){hero.wardCharges--;hit=0;addLog(s,`${hero.name}'s Guardian Ward blocks the strike!`,now)}
    hero.hp=Math.max(0,hero.hp-hit);
    addLog(s,`${foe.name} strikes ${hero.name} for ${hit} damage (${hero.hp}/${hero.maxHp} HP).`,now);
    if(hero.hp===0){hero.downedUntil=b.round+3;addLog(s,`${hero.name} is down! Three rounds to revive.`,now);emitEvent(s,'downed',{player:hero.id},now)}
    return true;
  };
  for(const foe of initialFoes){
    const targets=heroTargets().sort((a,z)=>actorDistance(a,foe)-actorDistance(z,foe));
    if(!targets.length)break;
    let target=targets[0];
    if(foe.role==='ninja'){
      target=[...targets].sort((a,z)=> (actorDistance(a,foe)*1.2+a.hp/a.maxHp*2)-(actorDistance(z,foe)*1.2+z.hp/z.maxHp*2))[0];
      if(foe.hp/foe.maxHp<.31&&actorDistance(target,foe)<=2&&b.enemyPhases-(foe.lastRetreat||-10)>3){
        closeTo(foe,target,true);foe.lastRetreat=b.enemyPhases;addLog(s,`${foe.name} withdraws to regroup.`,now);continue;
      }
    }
    if(foe.role==='healer'&&b.enemyPhases%3===0){
      const injured=b.enemies.filter(x=>x!==foe&&x.hp>0&&x.hp<x.maxHp&&actorDistance({x:x.x,y:x.y},foe)<=2);
      if(injured.length){for(const ally of injured)ally.hp=Math.min(ally.maxHp,ally.hp+Math.max(1,Math.ceil(ally.maxHp*.15)));
        addLog(s,`${foe.name} heals ${injured.length} nearby allies.`,now);continue;}
    }
    if(foe.role==='cloner'&&!foe.clone&&b.enemyPhases%3===0&&b.enemies.filter(x=>x.hp>0).length<11){
      if(b.enemies.filter(x=>x.hp>0&&x.parentId===foe.id).length<2){
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const clone={...foe,id:`${foe.id}-copy-${b.enemyPhases}`,name:`Clone of ${foe.name}`,role:'normal',variant:'normal',parentId:foe.id,clone:true,hp:Math.max(1,Math.round(foe.maxHp*.45)),maxHp:Math.max(1,Math.round(foe.maxHp*.45)),atk:Math.max(2,Math.round(foe.atk*.7)),armourDie:Math.max(2,foe.armourDie-2),x:foe.x+dx,y:foe.y+dy};
          if(enemyCanOccupy(s,roomId,clone,clone.x,clone.y)){b.enemies.push(clone);addLog(s,`${foe.name} creates a weaker copy!`,now);break}
        }
      }
    }
    if(foe.role==='teleporter'&&b.enemyPhases%3===0){
      const choices=[];
      for(let y=0;y<roomSize(roomId).height;y++)for(let x=0;x<roomSize(roomId).width;x++)if(Math.abs(x-foe.x)+Math.abs(y-foe.y)<=4&&enemyCanOccupy(s,roomId,foe,x,y))choices.push([x,y]);
      choices.sort((a,z)=>actorDistance(target,{...foe,x:a[0],y:a[1]})-actorDistance(target,{...foe,x:z[0],y:z[1]}));
      if(choices.length){foe.x=choices[0][0];foe.y=choices[0][1];addLog(s,`${foe.name} blinks across the room.`,now);continue}
    }
    if(foe.role==='armoured'&&b.enemyPhases%2===0){strike(foe,target);continue}
    if(strike(foe,target))continue;
    closeTo(foe,target);
    const freshTarget=heroTargets().sort((a,z)=>actorDistance(a,foe)-actorDistance(z,foe))[0];
    if(freshTarget)strike(foe,freshTarget);
  }
  if([10,11,13].includes(ROOM_DATA[roomId].quest)){
    const hazard=ROOM_DATA[roomId].hazard;
    const phase=(b.enemyPhases+(ROOM_DATA[roomId].hazardPhaseOffset||0))%3;
    const active=hazard==='chaos'||hazard==='storm'?phase===0:phase!==0;
    b.hazardPhase=phase;
    if(active){
      const dangerous=new Set((HARD_HAZARDS[roomId]||[]).map(([x,y])=>x+','+y));
      for(const hero of heroTargets()){
        if(!dangerous.has(hero.x+','+hero.y))continue;
        const defending=b.actions[hero.id]?.type==='defend';
        if(hazard==='storm'){
          const direction=(Number(roomId.match(/r(\d+)/)?.[1]||1)%2)?1:-1;
          let shifted=0;for(let step=0;step<2;step++){const nx=hero.x+direction;if(nx<0||nx>=roomSize(roomId).width||occupied(s,roomId,nx,hero.y,hero.id))break;hero.x=nx;shifted++;}
          addLog(s,`${hero.name} is buffeted by a storm gust${shifted?' and pushed '+shifted+' squares':' but holds position behind cover'}.`,now);
        }else{const hit=defending?2:5;
          hero.hp=Math.max(0,hero.hp-hit);
          addLog(s,`${hero.name} suffers ${hit} ${hazard==='chaos'?'chaos energy':'flood'} damage.`,now);
          if(!hero.hp){hero.downedUntil=b.round+3;emitEvent(s,'downed',{player:hero.id},now);} }
      }
    }
  }
  // The Abyss: illuminated pools matter. Lanterns are persistent room state.
  // Darkness wounds heroes outside the entrance glow or lit lanterns each third phase.
  if(ROOM_DATA[roomId].quest===14 && (b.enemyPhases+(ROOM_DATA[roomId].hazardPhaseOffset||0))%3===0){
    const lanterns=ABYSS_LANTERNS[roomId]||[];
    for(const hero of heroTargets()){
      const safe=(hero.x<=2&&Math.abs(hero.y-doorRow(roomId))<=2)||lanterns.some(([x,y],i)=>b.litLanterns?.includes(i)&&Math.abs(hero.x-x)+Math.abs(hero.y-y)<=3);
      if(safe)continue;
      const defending=b.actions[hero.id]?.type==='defend',damage=defending?2:6;
      hero.hp=Math.max(0,hero.hp-damage);
      addLog(s,`${hero.name} suffers ${damage} damage in the unlit abyss. Seek a lantern!`,now);
      if(!hero.hp){hero.downedUntil=b.round+3;emitEvent(s,'downed',{player:hero.id},now);}
    }
  }
  // Warrens: a failure causes room-number dice to appear AFTER the enemy phase,
  // making the new arrivals eligible to attack next round, not instantly.
  if(ROOM_DATA[roomId].quest===9){
    const activeNests=(b.nests||[]).filter(n=>n.active);
    const spawnAt=(nest,count)=>{
      for(let n=0;n<count&&b.enemies.filter(e=>e.hp>0).length<24;n++){
        const enemy={id:`${roomId}-nest-spawn-${b.nestSpawns++}`,name:'Warrens Swift D10',faces:10,variant:'normal',role:'swift',clone:true,parentId:'nest',hp:20,maxHp:20,atk:36,armourDie:25};
        const open=[];for(let y=0;y<roomSize(roomId).height;y++)for(let x=0;x<roomSize(roomId).width;x++)
          if(enemyCanOccupy(s,roomId,enemy,x,y)&&!(b.nests||[]).some(t=>t.active&&t.x===x&&t.y===y))open.push([x,y]);
        open.sort((a,z)=>(Math.abs(a[0]-nest.x)+Math.abs(a[1]-nest.y))-(Math.abs(z[0]-nest.x)+Math.abs(z[1]-nest.y)));
        if(!open.length)break;enemy.x=open[0][0];enemy.y=open[0][1];b.enemies.push(enemy);
      }
    };
    for(const pending of b.nestQueue||[])spawnAt(pending,pending.count);
    b.nestQueue=[];
    // Active nests periodically hatch a single scout; never an uncontrolled
    // exponential wave. Players can stop the hatch by pressing N beside a nest.
    if(b.enemyPhases%3===0)for(const nest of activeNests)spawnAt(nest,1);
  }
  // A Zombie gets one full enemy phase inert after its first defeat, then rises
  // once at 50% health. It awards combat XP only after its final defeat.
  for(const foe of b.enemies.filter(e=>e.role==='zombie'&&e.hp<=0&&!e.revived)){
    if(foe.awaitRevival>1)foe.awaitRevival--;
    else{foe.revived=true;foe.awaitRevival=0;foe.hp=Math.max(1,Math.ceil(foe.maxHp*.5));addLog(s,`${foe.name} rises again at half health!`,now);}
  }
  }
  // Once everyone has left, ordinary encounters return to their initial state;
  // incomplete retreat rules for the full game will be implemented later.
  if(!livingParticipants(s,roomId).length){
    b.status='dormant';b.enemies=[];b.deadline=null;b.actions={};b.turnEnded={};
    if(!Object.values(s.players).some(p=>p.connected&&p.hp>0)){
      // Prototype's sole checkpoint is the Woodland Path; party wipe recovery.
      for(const p of Object.values(s.players)){const pt={one:[1,3],two:[1,4],three:[1,2],four:[1,5]}[p.id]||[1,1];p.room='woodland';p.x=pt[0];p.y=pt[1];applyDeathPenalty(s,p,now)}
      addLog(s,'The team was defeated and returned to the Woodland Path checkpoint.',now);
      s.revision++;return {saved:'checkpoint'};
    }
    addLog(s,'The abandoned encounter resets.',now);s.revision++;
    return {saved:null};
  }
  b.round++;b.actions={};b.turnEnded={};b.deadline=null;
  for(const p of Object.values(s.players).filter(p=>p.room===roomId&&p.hp===0&&p.downedUntil!==null&&p.downedUntil<b.round)){
    p.downedUntil=null;addLog(s,`${p.name} missed the revive window.`,now);
  }
  s.revision++;
  return {saved:null};
}
export function tick(s,now=nowMs()){
 const current=globalActivePlayer(s);
 if(!current||!s.turn?.deadline||now<s.turn.deadline)return [];
 const result=endTurn(s,current,now,Math.random,{timeout:true});
 addLog(s,`${s.players[current].name}'s timed turn ended automatically.`,now);
 return [{room:s.players[current]?.room||'global',result}];
}
/** Take an already earned, individually sealed quest-boss equipment chest.
 * Replays do not create endless identical boss chests; XP and gold remain.
 * Choice is one of the four existing equipment classes (including ranged bow specials). */
export function claimQuestReward(s,id,quest,category,now=nowMs()){
 const p=readyPlayer(s,id);ensureWorld(s);
 if(!['Sword','Bow','Mace','Staff','Armour'].includes(category))throw new Error('Choose Sword, Bow, Mace, Staff or Armour');
 const key=`${id}:${quest}`,offer=s.questRewardOffers?.[key];
 if(!offer||offer.quest!==quest||s.questRewardClaimed?.[key])throw new Error('No unclaimed quest chest');
 const rarity=offer.rarity;const level=Math.min(p.level,offer.level);
 const piece={id:itemId(p,'equipment'),kind:'equipment',category,rarity,level,bonusDie:RARITY_DICE[rarity],name:`${rarity} ${category} · Quest ${quest} Victory · L${level}`,enchantments:[],bossReward:true};
 p.inventory.equipment.push(piece);delete s.questRewardOffers[key];s.questRewardClaimed[key]=true;
 addLog(s,`${p.name} chose a ${rarity} ${category} from Quest ${quest}'s victory chest.`,now);
 emitEvent(s,'victory-reward',{player:id,quest,rarity,category},now);s.revision++;return {saved:null,item:piece};
}

export function publicState(s,viewerId){
  const snapshot=clone(s);snapshot.me=viewerId;
 // The Maze has a player-specific public projection. Never send hidden topology,
 // deterministic loot seeds, boss secret, or other players' claim ledgers.
 delete snapshot.mazeRuns;delete snapshot.lastMazeBoss;
 snapshot.questRewardOffers=Object.fromEntries(Object.entries(s.questRewardOffers||{}).filter(([key])=>key.startsWith(viewerId+':')));
 delete snapshot.questRewardClaimed;snapshot.roomDefinitions=ROOM_DATA;snapshot.shopStock=SHOP_STOCK;snapshot.roomWalls=ROOM_WALLS;snapshot.roomHazards=HARD_HAZARDS;snapshot.roomLanterns=ABYSS_LANTERNS;
  snapshot.shopStock=merchantStock(s,viewerId).map(item=>({...item,cost:classPrice(s.players[viewerId],item,(s.cityDistricts||[]).includes('q12r2'))}));
  // Quest board and maze UI see the VIEWER'S completion history, not the
  // aggregate world progress or another character's advanced unlocks.
  const viewer=s.players[viewerId];
  snapshot.completedQuests=normalizedCompletions(viewer?.completedQuests);
  snapshot.unlockedQuest=unlockedQuestCeiling(snapshot.completedQuests);
  snapshot.questTiers=QUEST_TIERS.map(t=>({name:t.name,quests:t.quests,complete:t.quests.filter(q=>snapshot.completedQuests.includes(q)).length,unlocked:t.min<=snapshot.unlockedQuest}));
  snapshot.turn.activePlayer=globalActivePlayer(s);
  for(const [roomId,room] of Object.entries(snapshot.rooms)){if(room.battle.status==='active')room.battle.activePlayer=globalActivePlayer(s);}
  for(const p of Object.values(snapshot.players)){
    p.combatStats=effectiveStats(p);
    // Each connection may see shared positions, combat stats and HP, but never
    // another player's private inventory or one-time treasure claims.
    if(p.id!==viewerId){
      delete p.inventory;delete p.equipped;delete p.lootClaimed;delete p.completedQuests;delete p.unlockedQuest;
      delete p.gold;delete p.wardCharges;delete p.superRoom;delete p.specialUsedAt;delete p.trainingRackClaimed;delete p.questBookmarks;delete p.lastCampQuest;
    }
  }
  // No personal credentials or authentication data are stored in game state.
  return snapshot;
}
