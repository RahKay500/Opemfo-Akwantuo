import { config } from "zod";

// Zod's JIT probe (`new Function("")`) always throws under our CSP — script-src
// has no 'unsafe-eval' in production, by design (next.config.mjs) — but the
// throw itself is still reported as a CSP violation in DevTools even though
// Zod catches it. `jitless` skips the probe entirely; validation just runs
// through Zod's interpreted path, which is what happens anyway once the probe
// fails, so this has no functional effect in production.
config({ jitless: true });
