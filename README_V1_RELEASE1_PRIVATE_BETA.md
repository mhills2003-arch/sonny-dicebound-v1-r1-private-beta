# DICEBOUND V1 Multiplayer — Release 1 Private Beta

**Source package. This ZIP does NOT modify, replace, or deploy `https://sonnylanning.com/dicebound/` or the Sonny Lanning author site.**

## Implemented in this package

- **Private landing page** at `/dicebound-beta/` following invitation-code authentication, offering separate **Local Multiplayer** and **Online Multiplayer**.
- **Local 1–4 players on one device:** the parent host chooses a seat count. Each seat keeps its own live WebSocket connection to a separate Durable Object and uses a visible **Pass the device to Player** control. The shared turn order remains authoritative on the server. This is separate from the original online game's save.
- **Online up to four players on separate devices:** the game's existing four authorized player identities and four-player turn sequence are retained. Each uses its own invite token, configured as Cloudflare secrets.
- **Character registration:** before playing, each connected player chooses a name (2–24 characters) and one permanent Knight, Outlaw, Warlock or Tinker class. The server stores the name and class; reconnecting doesn't overwrite either. Existing legacy characters retain their class and progress and can register a name.
- Existing beta content is preserved: quests 1–15, equipment, combat, class perks, and the saved six-boss endgame Maze in both session types.
- The public `/dicebound/` original V1 stays untouched by the package.

## Not yet implemented / not to be misrepresented

- **Parent-managed friend directory:** the current invitations are four fixed server-configured access identities (`INVITE_TOKEN_1` through `_4`). They are *reusable* until a parent changes/revokes them; they are not new per game. Up to three friends can hold distinct online tokens at one time. The fuller persistent friends-list and recognised-device flow, including >3 approved friends, is a follow-up, NOT an implemented feature.
- **Difficulty tier unlocking** remains the existing sequential campaign behaviour. The approved change to unlock a whole difficulty after all quests in the previous tier is a later gameplay release.
- **Local gameplay**, multiplayer disconnections, existing saves, and online invitation codes have not been validated on the real Cloudflare deployment or multiple physical devices. This is an engineering beta for supervised testing, not production-ready child-facing multiplayer.
- No changes were made to current live V1's original code or URL.

## Installing as a new isolated private Worker

1. **Back up your working V1 and V2 repositories. Do not touch either live deployment.** Put this ZIP's contents into a **new** GitHub repository or separate private testing branch/repository.
2. `wrangler.toml` deliberately uses a **new** Worker name, `sonny-dicebound-v1-r1-private-beta`, `workers_dev=true`, and has **no custom domain routes**. Connect this new repository to that worker using your usual GitHub/Cloudflare build process, or deploy with `npm install && npx wrangler deploy` if you use Wrangler. Do **not** change its name to `sonny-lanning`, `sonny-dicebound` or any currently serving Worker.
3. In the **new private Worker**, set encrypted secrets under **Settings → Variables and Secrets**: unique `INVITE_TOKEN_1`, `INVITE_TOKEN_2`, `COOKIE_SECRET`; add `INVITE_TOKEN_3` and `INVITE_TOKEN_4` for four online seats. Each invitation token must have at least 24 characters, the cookie secret at least 32. Use random values from your password manager; do not commit them. Optional `PLAYER_n_NAME` variables label an unregistered player.
4. Open `https://<your-private-worker-subdomain>/dicebound-beta/` once the deploy succeeds. Use the **Player One** token as the supervising adult to set up local play. For online play, use separate devices with the distinct parent-issued Player 1–4 tokens.
5. In local mode, select 1–4 players, then pass the device around to let each seat register a name/class. During play switch seats with the buttons in the header. Each player takes their own turn. In online mode, each device registers its own character. The six-boss Maze remains available subject to the normal campaign access rules.
6. **Do not promote** this to the `https://sonnylanning.com/dicebound/` landing page until an adult tests local, online, recovery, invitations and saved progression and you explicitly approve promotion.

## Safety and deployment notes

- The two modes use separate Durable Object identifiers: `v1-local-four-seat-test` and `quest-01-two-player-prototype` (latter reused only inside the **new Worker**, not the live game's storage).
- Local seat overrides are accepted only from a signed **Player One** host session; an online visitor may never select another player ID.
- Online access cookies last 12 hours; a friend can re-enter the **same reusable token** afterwards. One-time forever device recognition isn't built yet.
- Parent-issued codes are credentials. Never publish them, embed them into the front-end, or share them publicly.
- Chat moderation is still **development-grade**. Keep children supervised and disable production invitations until controls are audited.
- `wrangler.toml` is a standalone beta deployment configuration. If merging into an existing project, retain existing secrets/migration history and check configuration carefully.

## Verification completed locally

- `npm test`: **298/298** tests passed, including new name/class persistence and mode-isolation checks.
- Node HTTP smoke simulation passed: invitation login, landing page, private static asset routing, local host permission, local/online separate world selection, and online identity protection.
- Source syntax checked with Node 22.
- **Not claimed:** live Cloudflare multiplayer testing or a full browser gameplay session.

## Next approved work, after beta testing

1. Parent-managed friend approvals and invitation/device registry (rather than fixed numbered tokens).
2. Shared Maze validation in local and online modes, and joining/reconnecting across devices.
3. Tier-based quest unlocking and any remaining approved gameplay fixes.

**Original V1 URL (unchanged):** https://sonnylanning.com/dicebound/
