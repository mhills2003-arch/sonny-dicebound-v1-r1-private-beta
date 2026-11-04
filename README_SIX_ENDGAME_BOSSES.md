# DICEBOUND 4.0 — Six Endgame Maze Bosses (private beta candidate)

**Scope:** This is the complete co-operative feature beta source update, built on `DICEBOUND4_FEATURE_COMPLETION_MAZE_CLASSES_STAFFS_BETA.zip`. Includes the previously developed 15 quests, Maze, four classes, staffs, personal quest rewards and current equipment rarity rules. It does NOT deploy anything by itself. Tested with Node.js v22.16.0. 

## The six boss fights

All final Maze bosses keep their randomly selected identity across save/resume; immediate repeats between new expeditions are prohibited. Each fight uses a 7×7 server-validated arena, visible hazard squares warned a full tactical round in advance, shared co-operative actions with a 60-second deadline, party-sized attendant waves, three sequential phase events without health restoration, and a different arena interaction that reveals a temporary weakness. A hero may move one square or perform one combat action per round. All weaknesses are optional; bosses can also be defeated by normal combat.

| Boss | Distinct mechanic | Tactical interaction |
|---|---|---|
| The Iron Regent | Sweeping iron lanes, marching sentries, magnetic pull | Brace behind one of four iron anchors, avoiding the pull and opening an armour joint |
| The Cinder Wyrm | Sweeping flame arcs, lingering warned hot tiles, emberlings | Open cooling valves to cancel current fire and expose the scales |
| The Mirror Queen | Diagonal reflected beams, glass decoys | Inspect three mirrors; the true shadow reveals the Queen, false glass summons another decoy |
| The Root Colossus | Advancing root lanes, timed movement snares, thorn guardians | Sever two anchoring roots to expose heartwood (roots regrow in the last phase) |
| The Hourglass Warden | Rotating clock-hand lanes, delayed sand echoes | Reverse the central hourglass on a short cooldown to cancel a warned attack and expose the Warden |
| The Hollow Titan | Contracting void rings, gravity pull, void fragments | Stabilise both regulators to expose the hollow heart |

The Maze journal still stores **2–3 identity/attack/optional weakness clues**; the weakness text is not revealed in the public view until the optional third clue has been discovered. Arena objects and phase/secondary warnings remain observable so players can discover tactics experimentally without clues. False mirror identity and Maze seeds are never sent in the browser's public state.

## Co-op safety and continuity in the combat engine

- Party joins add attendants, and existing summoned enemies persist when others leave. Last-party-member retreat resets the boss and summons for a clean rematch; earlier earned personal inventory is not rolled back.
- Old saved fights without the boss substate are migrated on entry/reconnect. A player reopening a save after the party's complete retreat is returned to the safe approach chamber.
- Downed characters cannot flee to bypass the three-turn revive window. Hazard damage skips downed characters; revived heroes receive hazard protection until their next tactical action opportunity.
- Defend cuts remaining hazard damage after normal armour. Multiple dangerous tiles are merged into one warned hazard hit per player per round. Extra minions choose unoccupied / safe spawn squares when available.
- Boss HP, attack and attendant strength scale with the real party’s equipment/level, so a Level 25 character is not effectively immune to the fight. The three mandatory phase beats are not bypassed by a giant damage roll. Boss HP cannot drop below 1 before the final phase has acted, then the boss can be defeated normally. Summoned enemies still need defeating before the room is declared clear.
- Personal victory chests and gold/XP rewards retain their previous one-time claim protections. The six bosses use the existing 75% Legendary / 20% Mythic / 5% Exotic final chest rarity probabilities.

## Deploy to the isolated beta only

1. Finish the current adventure, return all players to camp, log out, and back up your current `dicebound-4` GitHub repository.
2. Extract this archive locally. Replace **every file matching its relative path** under `src/`, `public/`, and `test/` in the beta repository, **including the new** `src/maze-boss-kits.mjs` **and** `test/maze-six-boss-combat.test.mjs`. Never upload the ZIP as a file in GitHub: upload its *contents*.
3. Keep existing `public/assets/`, `package.json`, Wrangler/Cloudflare configuration and private secret bindings intact. Do not commit invitation code files.
4. Make one coherent GitHub commit so Cloudflare does not run mixed-version tests; allow the new build to complete. The banner should say `ENDGAME MAZE · SIX BOSSES · PHASED COMBAT`.
5. Supervised testing: ideally use two devices. Reach a boss through the Maze, examine the 7×7 arena, try attacks and interacting with labelled objects, test at least one full three-phase battle, flee with only one teammate and then both, return to saved positions, and claim a reward once.

## Validation and limitations

The complete source package passes **284 Node automated tests**, including the existing full campaign regressions plus 22 new boss-specific cases. Re-extract the ZIP to a new folder and run `npm test` (Node >=22) before deployment; no additional dependencies are necessary for these tests.

This is still a **private, adult-supervised beta**. A successful test/build does not verify gameplay on real multi-device Cloudflare deployments or make it safe to invite children. Parent-issued credentials and approvals, moderation/privacy controls, authoritative item transaction guarantees under crashes, full 4-device latency testing and security review are not yet finished. The solo game `/dicebound/` and Sonny Lanning author website are untouched by this source package.
