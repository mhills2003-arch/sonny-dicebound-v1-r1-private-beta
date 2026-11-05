# DICEBOUND V1 Multiplayer Beta R2.3 — Online Presence Fix

**Target:** The private multiplayer beta repository only. Never deploy to sonnylanning.com/dicebound/.

**Problem:** When Player 2 logged out, the server saved the character and marked them offline, but Player 1 continued to see an apparently active piece. The disconnected character's old square also blocked movement.

**Changes**
- Only connected adventurers appear as physical pieces on the tactical board and Maze boss board.
- The party list retains disconnected characters and explicitly shows **Offline**. Room counts now count online players only.
- A disconnected adventurer no longer occupies a gameplay collision square. If another player later occupies their old position, normal server-side position reconciliation moves the returning adventurer to a nearby valid tile.
- All quest progress, levels, equipment, inventory, local/online world isolation, turn handling, and authentication remain unchanged.
- The server already broadcasts disconnections when the WebSocket closes; no polling or new Durable Object request loops were added.

**How to test:** Have P1 and P2 enter online play in the same room. Sign out of P2. Once the socket disconnects, P1 should see P2's status **Offline**, and P2's piece should disappear; P1 should be able to step onto P2's former square. Sign back in with P2's code: their piece should return in a valid position, with progress preserved. Repeat with local multiplayer to confirm connected players still block one another.

**Installation:** Extract this entire ZIP into the existing *private multiplayer beta* GitHub repository, replacing matching files. Commit changes and wait for successful Cloudflare deployment. Existing Cloudflare secrets stay unchanged.
