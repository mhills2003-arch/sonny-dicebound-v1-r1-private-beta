# DICEBOUND 4.0 — Four Class Benefits (multiplayer beta)

This is a **complete GitHub update**, based on the previous six-boss release. It is NOT a patch to the original solo game. The original /dicebound/ site and author website are not touched by these files.

## The four permanent class perks

| Class | Finds | Merchant discount | Combat |
|---|---|---|---|
| Knight | +25% relative successful equipment searches (50% → 62.5%) | Maces and Plate Mail / Armour 25% cheaper | Mace attack +1D2; Plate Mail defence +1D2 |
| Outlaw | +25% gold per successful coin pickup | Swords and Shields 25% cheaper | Sword attack +1D2; shield defence +1D2 |
| Warlock | +25% relative successful healing-potion searches (50% → 62.5%) | Staffs and Guardian Tonic / Ward 25% cheaper | Staff attack +1D4 |
| Tinker | +25% relative successful enchantment searches (50% → 62.5%) | Superstrength, Meteor, Bomb and Guardian Tonic 25% cheaper | Blast Bomb and Meteor Scroll each +1D4 per hit |

The 25% search bonus increases *finding* an item, not its rarity distribution. Legendary/Exotic odds, Coin of Ages 1/500 and Multishot V 1/1500 remain unchanged. Class bonus dice are extra dice, NOT a change to the base attack/armour die. Normal player-friendly fire restrictions remain in force.

Existing players retain their class, progress and inventory. Previously unconfirmed legacy class assignments DO NOT receive perks until the user makes their permanent selection. No character may change an already confirmed class. Shields have an offhand-only equipment slot and defensive benefit. Shop quotes are personal and computed authoritatively on the server; any existing city discount stacks multiplicatively.

Maze exploration and combat share class search/gold/combat perks; bomb, meteor, ward and superstrength are now usable as Maze combat actions. All shop/loot and combat commands remain server-validated and one-use consumables are deducted at resolution.

## GitHub update steps

1. **Back up** current repository branch, verify previous successful deploy, and end all active player encounters.
2. Extract this ZIP locally. Replace the contents of `src`, `public`, and `test` in your **beta** GitHub repository, adding new files. Retain your own Cloudflare secrets/config and any custom image assets.
3. Ensure `test/class-perks-complete.test.mjs` is included. Commit all files **together**; avoid a series of commits with old tests and new src.
4. Check Cloudflare Deployments and open the beta on two devices to test classes, prices, fights and maze.

Tests: 293/293 locally, and from a clean ZIP extraction. This does not imply successful Cloudflare deployment or production-grade multiplayer security.

Known previous Cloudflare failure: `test/maze-integration.test.mjs` expected `completed` after a boss reward; this package uses the existing six-boss source and its matching test, which pass locally. If Cloudflare still reports a failure, inspect the full build log rather than assuming it is a stale test.
