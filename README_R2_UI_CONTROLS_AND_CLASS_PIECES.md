# DICEBOUND V1 Multiplayer Private Beta — R2 UI, Hotkeys and Class Pieces

**Target:** Existing private beta Worker `sonny-dicebound-v1-r1-private-beta`, GitHub repository `mhills2003-arch/sonny-dicebound-v1-r1-private-beta`.

**Do not upload to or deploy over** `sonnylanning.com/dicebound/` or the abandoned visual V2 worker. **No new Worker is needed.**

## What's new

1. **Hotkeys in local and online modes**: arrow keys movement; R Roll, E End Turn, A Attack, I Inventory, F Fortify, C Camp, P Items, S Special, L Adventure Log, Q Quest List. N still performs the special nest-disable action when available; Space still attacks as a compatibility shortcut. WASD is deliberately no longer used for movement because A, S and R have approved actions. Do not trigger shortcuts while typing or in a game modal. The Abyss lantern action remains in the Items drawer instead of using L.
2. **V2-inspired, board-first responsive UI**: larger tactical board, clearer character HP / level / XP, compact roll/attack/fortify/special/items/end-turn row, collapsible left Search & Party drawer, existing right-side Encounter / Log, existing Chat button. On small screens the main action row appears *above* the board to keep it reachable.
3. **Four distinct class pieces**: Knight, Outlaw, Warlock, Tinker. All are new transparent assets in `public/assets/class-pieces/` (PNG plus editable SVG). Class art is chosen from each character's actual saved class, independently of P1–P4. Player ring/badge identifies who owns a piece if two players choose the same class. Character creation includes a class-art preview.
4. Preserved: local and online 1–4 player code, automatic local end-turn seat handoff, new/resume adventures, invitations and secrets, quests, the six-boss maze, all stats/combat rules and existing saves.

## Deployment

1. Back up the beta GitHub repository (or note the last known working commit).
2. Extract this ZIP **into the root of that beta repository**, replacing matching files. Do not upload the ZIP itself as a file.
3. Commit and push the changed files on `main`.
4. Watch **Cloudflare → Workers & Pages → sonny-dicebound-v1-r1-private-beta → Deployments** for Success.
5. Open `https://sonny-dicebound-v1-r1-private-beta.m-hills2003.workers.dev/dicebound-beta/`, sign in with your existing invitation token and hard refresh (Ctrl+F5) if needed.
6. Test both **Local** and **Online**. In Local, try all four class choices and verify End Turn hands over automatically. In Online, verify that each player can move *only* their own character. Test shortcut keys while focus is not in chat/name fields, and confirm entering text does not trigger them. Check a saved adventure resumes.

No Cloudflare secrets, routes, Worker names, Durable Object migrations or production domains were changed. Existing `wrangler.toml` and the server-side `src/` directory were preserved from the last successful beta build.

## Verification completed before handoff

- Existing engine/security/maze/turn tests: unchanged.
- New tests for shortcut mapping, input safeguards, all four transparent sprites, class art selection, HTML controls and Worker isolation.
- Desktop/tablet/phone static layout previews. Browser UI interaction checks for Items, Inventory, Quests and Search popouts using an isolated local page harness.
- **Not** tested on the live Cloudflare beta, four real devices or with authenticated server responses. The browser harness cannot confirm layout quality of a fully populated live battle.

## Rollback

If the new layout causes trouble, revert the beta GitHub repository to the preceding working commit and let Cloudflare redeploy. This will not alter the original V1 website.
