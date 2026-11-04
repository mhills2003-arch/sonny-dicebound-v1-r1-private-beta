# DICEBOUND V1 Private Multiplayer Beta — R2.2 Difficulty Tier Unlocks

## What changed

The campaign now unlocks **whole difficulty tiers**, rather than quests one-by-one:

| Difficulty | Quests | Requirement to unlock |
|---|---|---|
| Beginner | Q1 | Available immediately |
| Easy | Q2–Q4 | Complete Q1 |
| Medium | Q5–Q9 | Complete ALL Easy quests (Q2, Q3, Q4) |
| Hard | Q10–Q12 | Complete ALL Medium quests (Q5–Q9) |
| Extreme | Q13–Q15 | Complete ALL Hard quests (Q10–Q12) |

Within any unlocked tier, play quests in **any order**. Clearing one quest in the current tier does **not** unlock the next difficulty until the entire tier is finished.

Each of four multiplayer characters has an independent completed-quest list and tier access; a friend's advanced world does not unlock quests for somebody else. The game still shares battle and room state. If a boss was cleared before a late-joining player arrived, they can receive their own quest completion credit by reaching its already-cleared final exit, so they are not permanently blocked.

Merchant stock uses the buyer's personal tier access, not another character's progression. Endgame Maze creation still requires the creating host to have completed Quest 15.

## Existing saved adventures

Old V1 beta saves are migrated automatically once, preserving gear, level, gold, inventories, achievements, rooms and quest bookmarks. Because old versions only stored a *shared* highest-quest unlock number, the one-time migration credits each EXISTING character with the shared accomplishments already earned. Players who JOIN AFTER the migration begin their own Beginner progression instead of inheriting these completions.

Nothing about existing invitations, authentication, local/online session separation, 4-player turn order, character sprites, hotkeys or game UI has been changed.

## Deployment — private beta only

1. Back up your separate GitHub beta repository.
2. Extract this ZIP and copy the contents to the **root** of `sonny-dicebound-v1-r1-private-beta`, replacing matching files (do not add an enclosing directory and do not just upload the ZIP).
3. Commit to `main`. The existing separate Cloudflare Worker should automatically build and deploy.
4. Keep the current invitation secrets and cookies. No Worker or DNS changes are needed.
5. Once Cloudflare shows Success, refresh your private beta. **Do not deploy to** `sonnylanning.com/dicebound/`.

## Suggested in-game test

1. Start a **NEW** two-player LOCAL adventure. Completing Quest 1 should show **Q2, Q3 and Q4** all playable.
2. Finish Quest 4 before Q2/Q3; **Q5 must stay locked**. Finish the two remaining Easy quests; **Q5–Q9** should unlock together.
3. Switch between players; a player who has not completed Q1 should still see Easy locked, unless their personal quest was credited at the already-cleared final exit.
4. Repeat in ONLINE mode with separate player accounts.
5. Confirm an existing saved adventure still resumes and retains characters, equipment and progress.

## Verification

- 350/350 automated Node tests passed, including new tests for exact tier boundaries, character-specific access and progression save migration.
- Not independently tested on the live Cloudflare beta or across four physical devices. The deployment and in-game checks remain for the user.
