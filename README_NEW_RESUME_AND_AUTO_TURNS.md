# DICEBOUND V1 private beta — new/resume local adventures + automatic turns

**For the separate `sonny-dicebound-v1-r1-private-beta` repository only. Never deploy to your live Sonny Lanning /dicebound/ Worker.**

## Changes

* Landing page now makes **Start NEW adventure** versus **RESUME saved adventure** explicit.
* A new local adventure receives its own dedicated Durable Object game world. New seats cannot join a previous game's players, quests, items or characters.
* Previous adventures remain separately saved; on this browser their recent identifiers are retained in a server-signed HttpOnly cookie so they can be resumed. Avoid clearing site cookies if you need that save list. Old game data is not deleted on the server by this update.
* The original local beta save is offered in the Resume selector as **Existing beta adventure**. Its original `v1-local-four-seat-test` Durable Object is preserved. Choose the number of seats that previously used that particular legacy save. For new games, seat count is locked to the number chosen when created.
* The live Worker validates the signed selection before accepting local WebSocket seat connections, so changing URL parameters cannot attach an extra player to another save.
* Local End Turn automatically selects the next player once confirmed by server state (P1 → P2 → P3 → P4 → P1, as appropriate). Manual seat switches remain possible.
* Character creation advances to the next unconfigured local player after server confirmation; each player still chooses name and class.
* Online multiplayer, the original 15 quests, maze, authentication and game rules are otherwise unchanged.

## Deploy

Extract this ZIP into the **separate private-beta GitHub repository**, replacing matching files and committing. Cloudflare should build the beta Worker. Keep the existing Cloudflare invitation and cookie Secrets; the package contains **no secret values**. `wrangler.toml` retains the fixes `html_handling = "none"` and no `assets.base_path`.

## Test

1. From beta landing, choose **Resume saved adventure → Existing beta adventure**, with the seat count you previously used. Confirm your earlier characters are still present.
2. Return to the landing page, choose **Start NEW adventure → 4 players**. Confirm none of the earlier saved players or progression is present; create four distinct names and classes.
3. After P1's character creation, the view should switch to P2, and then P3/P4 as each is created.
4. Roll then press **End Turn** on P1; verify the view switches to P2 automatically. Continue through P3 and P4.
5. Return to landing and **Resume** either the original beta adventure or the new four-player adventure; verify the worlds are separate.
6. Verify online gameplay still works using separate player invitation codes.

### Limitation

The saved-adventure selection list lives in a signed browser cookie, and therefore belongs to that browser. If its cookies are cleared, an unlisted, newer local adventure cannot be rediscovered from a different browser without additional saved-session management; the legacy save remains selectable. This is adequate for private beta, but a server-backed adventure directory should replace it for durable long-term saves across devices.

Tests are not a substitute for validating the Worker on live Cloudflare.
