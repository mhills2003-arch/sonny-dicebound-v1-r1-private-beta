// DICEBOUND 4.0: 39 room-specific, deterministic tactical blueprints.
// # = solid obstruction; . = playable floor. One-square and 2×2 routes are validated.
// Quest 1 remains unchanged as the introductory tutorial.
export const ROOM_BLUEPRINTS = {
  "q2r1": [
    ".........",
    ".##....#.",
    "..#....#.",
    ".........",
    ".....#...",
    ".#...#.#.",
    "........."
  ],
  "q2r2": [
    ".........",
    "......#..",
    "...##....",
    ".........",
    "...##....",
    ".........",
    "........."
  ],
  "q2r3": [
    ".........",
    "...#.....",
    "...#.....",
    "...#..#..",
    "...#..#..",
    "......#..",
    "........."
  ],
  "q2r4": [
    ".........",
    "..###....",
    "......#..",
    "......#..",
    "......#..",
    "..###....",
    "........."
  ],
  "q2r5": [
    ".........",
    "...#.#...",
    "...#.#...",
    ".........",
    "...#.#...",
    "...#.#...",
    "........."
  ],
  "q3r1": [
    ".........",
    "..#...#..",
    "......#..",
    ".........",
    "....##...",
    ".........",
    "........."
  ],
  "q3r2": [
    ".........",
    "...##....",
    ".........",
    ".........",
    ".........",
    "...##....",
    "........."
  ],
  "q3r3": [
    ".........",
    "...#.....",
    "...#.....",
    "...#..#..",
    "......#..",
    "......#..",
    "........."
  ],
  "q3r4": [
    ".........",
    ".........",
    "...###...",
    "...###...",
    "...###...",
    ".........",
    "........."
  ],
  "q3r5": [
    ".........",
    ".#.......",
    "..#...#..",
    ".........",
    "..#...#..",
    ".......#.",
    "........."
  ],
  "q4r1": [
    ".........",
    "..##.....",
    "..##.....",
    ".........",
    ".....##..",
    ".........",
    "........."
  ],
  "q4r2": [
    "...#.....",
    "...#.....",
    ".........",
    ".........",
    ".....#...",
    ".....#...",
    ".....#..."
  ],
  "q4r3": [
    ".........",
    ".#.......",
    "...###...",
    "...###...",
    "...###...",
    ".........",
    "........."
  ],
  "q4r4": [
    ".........",
    "..#....#.",
    "..#......",
    "..#..#...",
    ".....#...",
    ".....#...",
    "........."
  ],
  "q4r5": [
    ".........",
    "...###...",
    "..#......",
    ".........",
    ".........",
    "...###...",
    "........."
  ],
  "q5r1": [
    "...##........",
    "...##...#....",
    "...##...#....",
    ".............",
    ".............",
    "........#....",
    "...##...#....",
    "...##...#....",
    "...##........"
  ],
  "q5r2": [
    "..........#..",
    "...#......#..",
    "...#......#..",
    "...#...#.....",
    "...#...#.....",
    "...#...#.....",
    ".......#.....",
    ".......#.....",
    "............."
  ],
  "q5r3": [
    "......#......",
    "......#......",
    "......#..#...",
    ".........#...",
    ".............",
    ".........#...",
    "......#..#...",
    "......#......",
    "......#......"
  ],
  "q5r4": [
    ".............",
    "........##...",
    "....##..##...",
    "....##.......",
    ".............",
    "....##.......",
    "....##..##...",
    "........##...",
    "............."
  ],
  "q5r5": [
    "..###........",
    "..###........",
    "..###..###...",
    ".......###...",
    ".............",
    ".......###...",
    "..###..###...",
    "..###........",
    "..###........"
  ],
  "q5r6": [
    "....#........",
    "....#.....#..",
    "....#..#..#..",
    ".......#.....",
    ".............",
    "....#..#.....",
    "....#..#..#..",
    "....#.....#..",
    "....#........"
  ],
  "q5r7": [
    ".............",
    "...##..#.....",
    "...##..#.....",
    ".......#.....",
    ".......#..#..",
    "...##..#..#..",
    "...##.....#..",
    "..........#..",
    "............."
  ],
  "q5r8": [
    ".......##....",
    "....#..##....",
    "....#........",
    ".............",
    "..........#..",
    "....#.....#..",
    "....#........",
    "....#..##....",
    ".......##...."
  ],
  "q6r1": [
    "..##..####...",
    "..##..####...",
    "..##..####...",
    ".............",
    ".............",
    ".............",
    "..##..####...",
    "..##..####...",
    "..##..####..."
  ],
  "q6r2": [
    ".............",
    "...##.....#..",
    "...##..##.#..",
    ".......##....",
    ".............",
    ".......##....",
    "...##..##....",
    "...##........",
    "............."
  ],
  "q6r3": [
    "...##........",
    "...##........",
    "...##........",
    "...##...##...",
    "...##...##...",
    "...##...##...",
    "........##...",
    "........##...",
    "........##..."
  ],
  "q6r4": [
    ".............",
    "........##...",
    "...#....##...",
    "...#.........",
    "...#.........",
    ".....##...#..",
    ".....##...#..",
    "..........#..",
    "............."
  ],
  "q6r5": [
    ".........##..",
    "..#......##..",
    "..#..##..##..",
    ".....##......",
    ".............",
    "..#..##......",
    "..#..##..##..",
    "..#......##..",
    ".........##.."
  ],
  "q6r6": [
    "....##..##...",
    "....##..##...",
    "....##..##...",
    "....##.......",
    ".............",
    "........##...",
    "....##..##...",
    "....##..##...",
    "....##..##..."
  ],
  "q6r7": [
    "...#.....#...",
    "...#.....#...",
    "...#.....#...",
    "...#..#..#...",
    "...#..#..#...",
    "...#..#..#...",
    "......#......",
    "......#......",
    "......#......"
  ],
  "q6r8": [
    ".............",
    "...##....##..",
    "...#......#..",
    ".............",
    "......##.....",
    "......##.....",
    "...##....##..",
    "...##....##..",
    "............."
  ],
  "q7r1": [
    ".............",
    "..###....###.",
    "..###....###.",
    ".............",
    ".....###.....",
    ".....###.....",
    ".............",
    ".............",
    "............."
  ],
  "q7r2": [
    "...##...##...",
    "...##...##...",
    "...##...##...",
    ".............",
    ".............",
    "........##...",
    "...##...##...",
    "...##...##...",
    "...##...##..."
  ],
  "q7r3": [
    ".............",
    "...##...##...",
    "...##...##...",
    ".............",
    ".............",
    "......#......",
    "...##...##...",
    "...##...##...",
    "............."
  ],
  "q7r4": [
    "...##........",
    "...##...#....",
    "...##...#....",
    ".............",
    ".............",
    "...##........",
    "...##...#....",
    "...##...#....",
    "...##........"
  ],
  "q7r5": [
    ".............",
    "......#......",
    "....#...#....",
    ".............",
    ".............",
    ".............",
    "....#...#....",
    "......#......",
    "............."
  ],
  "q7r6": [
    ".......##....",
    "...##..##....",
    "...##..##....",
    "...##........",
    ".............",
    "........##...",
    "...##...##...",
    "...##...##...",
    "............."
  ],
  "q7r7": [
    ".....#.......",
    "..#..#.......",
    "..#..#....#..",
    "..#..#....#..",
    "..#..#..#.#..",
    "..#.....#.#..",
    "..#.....#....",
    "........#....",
    "........#...."
  ],
  "q7r8": [
    "......#......",
    "...##.#......",
    "...##....##..",
    ".........##..",
    ".............",
    ".........##..",
    "...##....##..",
    "...##.#......",
    "......#......"
  ]
};
export const ROOM_CHALLENGES = {
  "q2r1": {
    "challenge": "Ore carts divide the mine approach. Clear the guards before checking the side workings.",
    "formation": "stagger"
  },
  "q2r2": {
    "challenge": "A crystal island splits the chamber. The Shiny D4 guards its far side.",
    "formation": "island"
  },
  "q2r3": {
    "challenge": "A zigzag gallery obscures the Shiny D6 until you turn the corner.",
    "formation": "flanks"
  },
  "q2r4": {
    "challenge": "A guarded vault wall forces an approach through the upper or lower passage.",
    "formation": "guard"
  },
  "q2r5": {
    "challenge": "Four crystal buttresses frame the boss chamber; isolate its Shiny bodyguard.",
    "formation": "boss"
  },
  "q3r1": {
    "challenge": "Huge footprints and fallen timber leave broad space for your first pursuit.",
    "formation": "stagger"
  },
  "q3r2": {
    "challenge": "A wide central clearing gives the Large D4 room to charge.",
    "formation": "centre"
  },
  "q3r3": {
    "challenge": "A root switchback offers small adventurers alternative lanes around a Large D6.",
    "formation": "flanks"
  },
  "q3r4": {
    "challenge": "The hollow trunk fills the middle of the forest; circle it to face the Large D8.",
    "formation": "island"
  },
  "q3r5": {
    "challenge": "Ancient standing roots make a ring of cover around the boss and Large D6.",
    "formation": "boss"
  },
  "q4r1": {
    "challenge": "Broken quarry steps create two separate lines of approach.",
    "formation": "flanks"
  },
  "q4r2": {
    "challenge": "Two offset galleries keep the Large and Shiny dice apart.",
    "formation": "stagger"
  },
  "q4r3": {
    "challenge": "The crystal pit is impassable; lead the Large Shiny D4 around its rim.",
    "formation": "island"
  },
  "q4r4": {
    "challenge": "Collapsed workings cut off straight sight lines and reward flanking.",
    "formation": "flanks"
  },
  "q4r5": {
    "challenge": "Terraces surround the royal excavation. The Large Shiny D4 comes before the boss.",
    "formation": "boss"
  },
  "q5r1": {
    "challenge": "An open gate funnels caravans into a central ambush with side approaches.",
    "formation": "gate"
  },
  "q5r2": {
    "challenge": "Three shifting dune ridges force a winding chase against Swift enemies.",
    "formation": "rush"
  },
  "q5r3": {
    "challenge": "An open firing lane is overlooked by a raised archer line and narrow side cover.",
    "formation": "archers"
  },
  "q5r4": {
    "challenge": "Parked iron wagons form four islands for armoured defenders to hold.",
    "formation": "island"
  },
  "q5r5": {
    "challenge": "A broken bridge squeezes the party into the middle as swift attackers flank.",
    "formation": "gate"
  },
  "q5r6": {
    "challenge": "An armour screen protects archers behind staggered battlements.",
    "formation": "shield"
  },
  "q5r7": {
    "challenge": "Smugglers hide behind crates; the side passage offers a route to the rear.",
    "formation": "flanks"
  },
  "q5r8": {
    "challenge": "Two side lanes bypass the toll barriers, but a boss blocks the far gate.",
    "formation": "boss"
  },
  "q6r1": {
    "challenge": "Waterlogged graves frame a long exposed causeway.",
    "formation": "gate"
  },
  "q6r2": {
    "challenge": "Grave islands divide the fight; zombies may rise again behind you.",
    "formation": "island"
  },
  "q6r3": {
    "challenge": "Two solid crypt wings force a long detour—unless you are a ghost.",
    "formation": "ghost"
  },
  "q6r4": {
    "challenge": "Fragmented islands favour teleporters that jump between safe ground.",
    "formation": "flanks"
  },
  "q6r5": {
    "challenge": "Sunken headstones create multiple pockets where resurrected foes can trap stragglers.",
    "formation": "stagger"
  },
  "q6r6": {
    "challenge": "A split causeway separates ordinary routes; ghosts ignore it while teleporters leap gaps.",
    "formation": "ghost"
  },
  "q6r7": {
    "challenge": "An interlocked maze of crypt passages makes every corner a possible ambush.",
    "formation": "rush"
  },
  "q6r8": {
    "challenge": "The mausoleum is broken into burial bays around the D20 guardian.",
    "formation": "boss"
  },
  "q7r1": {
    "challenge": "Three staggered flights of stone steps break long lines of sight.",
    "formation": "rush"
  },
  "q7r2": {
    "challenge": "A central watch corridor leaves exposed flanks for fast ninjas.",
    "formation": "flanks"
  },
  "q7r3": {
    "challenge": "Mirror pillars divide the floor; cloners spread copies between the reflections.",
    "formation": "island"
  },
  "q7r4": {
    "challenge": "The infirmary is separated into healing bays: reach the healers before the line recovers.",
    "formation": "shield"
  },
  "q7r5": {
    "challenge": "An open courtyard and isolated pillars give the ninjas room to flank.",
    "formation": "rush"
  },
  "q7r6": {
    "challenge": "Asymmetric chambers let cloners multiply behind separate cover.",
    "formation": "flanks"
  },
  "q7r7": {
    "challenge": "Tall library shelves create alternating blind alleys and short firing windows.",
    "formation": "rush"
  },
  "q7r8": {
    "challenge": "The abbot commands a divided sanctum; isolate support before the boss closes.",
    "formation": "boss"
  }
};

// Eight individually designed factory and eight burrow arenas. Hard quests remain unavailable.
export const MEDIUM_BRIDGE_BLUEPRINTS = {
  "q8r1": [
    "...#...#.....",
    "...#..###....",
    "...##........",
    "...#.........",
    "........#....",
    "......#......",
    "......#......",
    "......#.#....",
    "......#......"
  ],
  "q8r2": [
    ".............",
    ".............",
    ".....####....",
    ".....#.......",
    "....#...#....",
    ".......#.....",
    "...#.####....",
    ".......##....",
    "............."
  ],
  "q8r3": [
    ".............",
    "...#...#.....",
    "...##...##...",
    ".............",
    ".............",
    ".............",
    "......##.##..",
    ".............",
    "............."
  ],
  "q8r4": [
    ".............",
    "....#........",
    "....#........",
    "....#........",
    "........#....",
    ".............",
    "......#.#....",
    "........#....",
    "............."
  ],
  "q8r5": [
    ".............",
    "....#####....",
    ".............",
    "....#...#....",
    "......#......",
    ".............",
    ".............",
    ".....####....",
    "............."
  ],
  "q8r6": [
    ".............",
    "........#....",
    "....#...#....",
    "....#....#...",
    "....#........",
    "....#........",
    "........#....",
    "...#....##...",
    "............."
  ],
  "q8r7": [
    ".............",
    ".....##......",
    "...#####.....",
    "......#.#....",
    "......#.#....",
    "....#........",
    ".....####.#..",
    ".............",
    "............."
  ],
  "q8r8": [
    ".............",
    "........#....",
    "....##.......",
    "....##.......",
    "....#...#....",
    "...#.........",
    "......####...",
    "......####...",
    "............."
  ],
  "q9r1": [
    ".............",
    ".............",
    "....#........",
    "....#........",
    "....#...#....",
    "........#....",
    "...#..#.#....",
    "........#....",
    "............."
  ],
  "q9r2": [
    ".............",
    "....#####....",
    "....#........",
    "....#........",
    ".............",
    "........#....",
    "........#....",
    "...#.#####...",
    "............."
  ],
  "q9r3": [
    ".............",
    "...##...#....",
    "...#.........",
    ".............",
    ".....#.......",
    "......#......",
    "........#....",
    "........#....",
    "............."
  ],
  "q9r4": [
    ".............",
    "......#......",
    "...######....",
    "......#......",
    "......#.#....",
    ".............",
    "......#####..",
    ".............",
    "............."
  ],
  "q9r5": [
    ".............",
    ".......#.....",
    ".....#.......",
    "....#........",
    ".............",
    ".............",
    "......#......",
    ".......###...",
    "............."
  ],
  "q9r6": [
    ".............",
    "......#......",
    "..#####......",
    "......##.....",
    "........#....",
    "......#.#....",
    "......##.##..",
    ".............",
    "............."
  ],
  "q9r7": [
    ".............",
    ".............",
    "....#.#......",
    ".............",
    "....#........",
    ".....#..##...",
    ".....###.....",
    "........#....",
    "............."
  ],
  "q9r8": [
    "...#...#.....",
    ".......##....",
    ".......#.#...",
    "...#...#.....",
    "........#....",
    "....#........",
    ".............",
    "......#..#...",
    "......#......"
  ]
};
export const MEDIUM_BRIDGE_CHALLENGES = {
  "q8r1": {
    "challenge": "Split conveyor aisles leave two approaches to the machine guards.",
    "formation": "boss",
    "hazard": null
  },
  "q8r2": {
    "challenge": "A firing gallery overlooks the narrow belt passage.",
    "formation": "stagger",
    "hazard": null
  },
  "q8r3": {
    "challenge": "Heavy presses create islands for armoured dice to defend.",
    "formation": "flanks",
    "hazard": null
  },
  "q8r4": {
    "challenge": "Separate repair bays shelter enemy healers.",
    "formation": "archers",
    "hazard": null
  },
  "q8r5": {
    "challenge": "A long crossfire lane is interrupted by production equipment.",
    "formation": "shield",
    "hazard": null
  },
  "q8r6": {
    "challenge": "Two disjointed formations must be isolated before they reinforce.",
    "formation": "island",
    "hazard": null
  },
  "q8r7": {
    "challenge": "Die moulds hide ranged defenders at opposite ends.",
    "formation": "rush",
    "hazard": null
  },
  "q8r8": {
    "challenge": "A broken furnace protects the D20 armoured core guardian.",
    "formation": "gate",
    "hazard": null
  },
  "q9r1": {
    "challenge": "Swift scouts guard a small nest between two burrow mouths.",
    "formation": "stagger",
    "hazard": null
  },
  "q9r2": {
    "challenge": "A dogleg passage funnels reinforcements into a tight turn.",
    "formation": "flanks",
    "hazard": null
  },
  "q9r3": {
    "challenge": "Split crystal pillars give the pair of Cloners room to multiply.",
    "formation": "archers",
    "hazard": null
  },
  "q9r4": {
    "challenge": "Separate spawning hollows invite a flank around the swarm.",
    "formation": "shield",
    "hazard": null
  },
  "q9r5": {
    "challenge": "Mirror turns permit teleporters to surprise the rear rank.",
    "formation": "island",
    "hazard": null
  },
  "q9r6": {
    "challenge": "A three-way junction makes the fast swarm difficult to pin down.",
    "formation": "rush",
    "hazard": null
  },
  "q9r7": {
    "challenge": "Four Cloners defend a narrow gate; reach them before they replicate.",
    "formation": "gate",
    "hazard": null
  },
  "q9r8": {
    "challenge": "The Swarm Throne conceals the boss behind a final branching maze.",
    "formation": "guard",
    "hazard": null
  }
};
