# DICEBOUND V1 Multiplayer Beta — Local / Online Launch 404 Fix

**Issue:** After choosing Local Multiplayer player count or entering Online Multiplayer, browser reports `Not Found`.

**Cause:** Worker rewrites `/dicebound-beta/play` to the physical asset `/index.html`. Cloudflare Workers static-assets default HTML normalization redirects `/index.html` to `/`, which the Worker does not serve.

**Fix:** Set `html_handling = "none"` under `[assets]` in `wrangler.toml`. This tells `env.ASSETS.fetch` to serve `/index.html` directly with a 200 response. It does not change authentication, game code, saves, Durable Object namespace, Worker name, or secrets.

**Fastest GitHub deployment:** In your **new beta repository only**, edit root `wrangler.toml`; inside the `[assets]` section, add exactly `html_handling = "none"` (no change to other lines). Commit on `main`, wait for new Cloudflare build success. Do not upload the whole ZIP if you choose the single-file edit.

**Beta address:** `https://sonny-dicebound-v1-r1-private-beta.m-hills2003.workers.dev/dicebound-beta/`

**Checks:** local automated game tests and static route-configuration regression check passed. Live Cloudflare run still to be checked after deployment.

**Do not** deploy to `sonny-lanning`, `sonny-dicebound`, or `https://sonnylanning.com/dicebound/`.
