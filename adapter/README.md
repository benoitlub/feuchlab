# FEUCH LAB game adapter

External executor for Octopus's neutral `game.challenge.suggest` capability. Supports the existing 420 Dice and Feuch Dice mission contexts and preserves their existing JSON-in-`output.text` contract. Dice rules and fallback stay in the frontends.

Deploy separately using Wrangler from this directory (`npx wrangler deploy`). Set the adapter's secret with `npx wrangler secret put MISTRAL_API_KEY`; do not commit or share the value. Optionally configure `MISTRAL_MODEL`.

Register with Octopus after deployment:

```sh
curl -X POST https://octopus-engine-app.benoitlubert.workers.dev/adapters/register \\
  -H 'Content-Type: application/json' \\
  -d '{"id":"feuchlab-game","name":"FEUCH LAB game text adapter","version":"1","capabilities":["game.challenge.suggest"],"executeUrl":"https://feuchlab-game-adapter.YOUR-SUBDOMAIN.workers.dev/execute","healthUrl":"https://feuchlab-game-adapter.YOUR-SUBDOMAIN.workers.dev/health"}'
```

Replace YOUR-SUBDOMAIN with the actual deployed hostname. Current Octopus adapter registrations are in memory: after Octopus restarts, register again. This adapter does not bypass Mistral account/model authorization; a 403 still requires fixing access.
