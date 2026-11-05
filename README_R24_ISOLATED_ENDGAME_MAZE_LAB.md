# DICEBOUND V1 Multiplayer Beta R2.4 — Isolated Endgame Maze Lab

## Purpose

This update adds a **separate Maze testing world** to the working R2.3 multiplayer beta. It allows the six-boss Endgame Maze to be tested immediately **without completing Quest 15 in the real campaign**. The normal 15-quest campaign, invitation tokens, four-player local/online setup, saved characters, R2.3 disconnect handling, and tier unlocking are unchanged.

## Use (after a successful private-beta Cloudflare deployment)

1. Open the existing beta URL `/dicebound-beta/` and log in with your current invitation token.
2. On the game-mode selection page, look for **Endgame Maze Lab · isolated test adventure**.
3. Choose **ONLINE Maze Lab** for multiple devices, or **LOCAL Maze Lab** for the currently selected local adventure. For local, select/resume a local adventure first so the number of seats is known; then return to the mode selection page and choose the Maze Lab link. Online players each choose ONLINE Maze Lab on their own device.
4. Create a *new test-only* character name and class on first entry. The server places each test character at camp, gives them Level 25, temporary Mythic class gear, potions and a few bombs, and marks Quests 1–15 complete **only inside that separate Maze Lab state**.
5. Use the **🧭 Jump to Maze Lab controls** link at the top of the game. Player 1 creates Maze **Save 1**. Other players use **Join / Resume** on the same save slot. Explore, search, test team turns, leave/rejoin, and test the boss.
6. To return to the real saved campaign, click **Choose mode**, then choose the ordinary **Local** or **Online** game—not a Maze Lab link.

## Isolation and safety

- A maze-lab WebSocket uses a **different Durable Object namespace** from all ordinary local and online adventures. Its artificially unlocked quests, Level 25 levels, gear and Maze rewards **cannot be carried over** to the actual campaign.
- Only a logged-in invitation-token holder can access the lab. The origin Worker deletes any client-supplied test header and sets the header itself only when the explicit Maze Lab URL flag is present.
- Local Maze Lab sessions are also separated by the existing signed local-adventure ID; local seats remain restricted to the parent/host session.
- Lab saves persist between visits to support reconnect testing. All such saves are **test-only**. Clearing browser cookies may affect the local save menu just as it does for regular local play.
- The regular Endgame Maze continues to unlock after **Quest 15**. This release does not alter that progression gate.
- This is still a private, supervised development beta; do not distribute login tokens or enable unsupervised children's play.
- Close Maze Lab tabs after testing to avoid unnecessary Cloudflare Durable Objects usage; the free-tier daily limit is shared across the account.

## Test evidence and remaining limits

- Original working R2.3 test suite: **353 passing**.
- New Maze Lab isolation/permissions tests: **3 additional passing**.
- Total: **356/356 Node.js automated tests passing**.
- Additional ad hoc QA: **180 generated Maze seeds**, all six boss identities, four-player shared rounds, disconnect/reconnect, leave/resume, and hidden-seed checks.
- Not yet validated on actual Cloudflare devices: static tests and simulation **do not guarantee** full end-to-end WebSocket or visual gameplay, and no production deployment is made by this archive.

## Deploy only to the private beta repository

1. Backup or note the last known-good R2.3 GitHub commit.
2. Extract the entire ZIP and replace matching files in the existing **sonny-dicebound-v1-r1-private-beta** GitHub repository. Include **new** `src/maze-lab.mjs` and `test/maze-lab-isolation.test.mjs`.
3. Commit all files together and wait for Cloudflare to report Success. No new Worker, account secrets, binding names, or Cloudflare routes are required.
4. Open the existing beta address and test the Maze Lab links. The normal V1 site at `sonnylanning.com/dicebound/` is untouched.
5. If the beta does not behave as expected, revert the beta repository to the last good R2.3 commit before conducting further tests.
