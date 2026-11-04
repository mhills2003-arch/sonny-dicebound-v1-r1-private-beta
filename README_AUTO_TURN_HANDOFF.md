# DICEBOUND V1 Private Beta — Local automatic turn handoff

This is a **complete replacement source package for the separate private-beta GitHub repository only**. Do not upload it to the live sonnylanning.com V1 repository or the V2 repository.

## Change

In local multiplayer, clicking either End Turn button now waits for the server to confirm the new active player, then automatically selects that player’s local seat. This works for up to four players and wraps back to P1 on a new round. No change to combat sequencing, timers, server authority, saves, maze, invitation secrets or online multiplayer.

The manual P1–P4 selector is retained and a manual switch cancels any pending automatic handoff. A rejected End Turn does not switch seats. When no other player is eligible, the current seat stays selected.

## Deployment

Extract this ZIP into `sonny-dicebound-v1-r1-private-beta` GitHub repository, replacing matching files while preserving your Cloudflare-managed Secrets. Commit and wait for the beta Worker build. Do NOT change Worker name or attach a custom domain. Your existing V1 game remains untouched.

To apply as a minimal patch instead, upload only `public/app.js`, new `public/local-turn-handoff.mjs` and the new optional test. The `wrangler.toml` in this package also retains the previously approved `html_handling = "none"` setting.

## Test

1. Enter the beta and choose Local with 2 players. Finish character creation for both.
2. In P1, roll D6 and press End Turn. The active view should change to P2 automatically.
3. Roll and end P2's turn. It should return to P1 and begin the next round.
4. Check a rejected End Turn never switches seats; test 3–4 seats later.
5. Confirm Online mode still uses individual devices/identities and is unaffected.

Automated tests do not substitute for the live beta check.
