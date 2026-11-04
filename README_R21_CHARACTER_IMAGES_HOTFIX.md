# DICEBOUND V1 multiplayer beta — R2.1 character-pieces hotfix

This is a focused fix for the four class pieces appearing as broken images in character creation, and as only coloured rings/name labels in the game.

## Change

The original four **320×320 transparent PNGs** are preserved and now embedded as `data:image/png;base64` within the existing `public/app.js` module. Class selection preview, the active-character portrait, the four-player roster and the canvas battlefield all use the same image data. This eliminates any dependency on whether Cloudflare serves the separate `/assets/class-pieces/*.png` paths.

No changes to game rules, saves, multiplayer logic, invitation tokens, navigation or Worker configuration.

## GitHub deployment

Use this **complete replacement ZIP** by extracting into the existing beta repository `sonny-dicebound-v1-r1-private-beta`, replacing matching files and committing. Alternatively, upload only the modified `public/app.js` and `public/index.html`, plus the added test file. Leave the live V1 site untouched.

Wait for Cloudflare Success, then hard-refresh the beta game. In character creation, the selected Knight / Outlaw / Warlock / Tinker should appear, and on the board all four pieces should be rendered instead of empty rings. Two same-class players should still be differentiated by their numbered badges.

## Verification

Run `npm test` from the repository root. The R2 tests and the additional R2.1 checks should pass. A live authenticated Cloudflare session remains necessary to confirm deployment.
