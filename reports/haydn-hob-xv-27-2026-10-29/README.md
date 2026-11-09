# Haydn Hob. XV:27, III. Finale. Presto

Published the original downloaded MIDI without changing its events.

- Source page: https://www.el-atril.com/midis/Haydn.htm
- Source MIDI: https://www.el-atril.com/midis/Haydn/Haydn_Trios/fjht273.mid
- Rawl: https://rawl.rocks/f/haydn-piano-trio-hob-xv-27-iii-finale-presto
- Firestore document: `z9hXo1gNz5j1UjnEk7kd`
- SHA-256: `1cff3b5e84c59741a71244484c55218e6ed795f7d2851f005f6796da971e6a51`; 46927 bytes. Remote bytes read back exactly; one document and index entry verified.
- MIDI format 1, 240 PPQ, five tracks: conductor, violin, cello, piano RH, piano LH. Duration approximately 272.077 seconds.
- All 44 melody and 32 accompaniment pitch/onset pairs in Caplin example 3.8 agree with the downloaded MIDI's first eight bars.
- Source title retained verbatim from the IMSLP work heading. Source provenance retained in Firestore.
- Public catalog: appended only this slug to the existing Haydn corpus. Published in isolated gh-pages commit `8351e8c28`; new bundle `/static/js/main.206a3079.js`. Existing application code and local unrelated work preserved.
- Local corpus TypeScript syntax and unique local index checked.
- Chrome at rawl.rocks: four pitched voices rendered, duration 4:32; Play advanced the counter to 1:00, Pause changed to Resume. Console warnings/errors: none. Screenshot: `rawl-live.png`.
- Existing localhost:3000 was unavailable (ERR_CONNECTION_REFUSED); no development server was started.

Reproduction: `node reports/haydn-hob-xv-27-2026-10-29/publish.cjs` checks collisions; `--publish` uploads transactionally and verifies remote bytes. The command is idempotent for an existing matching record. Initial gRPC upload timed out; retry/readback found exactly one matching record. REST readback was also successful.

Public GitHub Pages deployment succeeded. Chrome confirmed the new main.206a3079.js bundle and the finale as item 10 in the Haydn corpus, with no console warnings/errors. A release query was used to avoid stale HTML cache. See `catalog-live.png` and `browser-verification.json`.
