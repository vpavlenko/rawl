# Istanbul instrument controls

Implemented in six scoped Rawl source files. The five original source hashes are recorded in source-hashes.json; the new file is instrumentVoiceGroups.ts. A guarded installation preserved the App changes that already existed. grouping.patch is the equivalent unified diff, and applied-source-hashes.json identifies the installed files.

Only slugs matching `fazil-say-istanbul-symphony-0[1-7]-…` group controls. Group identity uses the original instrument track name, so custom renaming and different arco/pizzicato/tremolo programs cannot split it. Violin I and Violin II remain separate instruments.

The merged legend displays one row per instrument. Checkbox, solo and hover affect every included member. Hover preview displays and highlights every member. Rename, octave, drum, strumming and exclusion changes apply atomically to the existing member indices. Restoring a removed instrument restores its members together.

MIDI events, audio channels, programs, CC11 streams, parser arrays, note IDs, note.voiceIndex and saved analysis indices are unchanged. Independent tremolo A/B channels remain independent. This changes grouped controls in the merged layout, rather than physically combining channels or rewriting stored notes.

Validation:

- `node check-groups.cjs`: passed pure grouping/mask/hover tests and actual candidate Rawl callback bodies for rename, octave, drum, strumming and exclusion.
- `node check-types.cjs`: whole project has 17 baseline TypeScript diagnostics and 17 with the candidate overlay, zero added diagnostics. See `typecheck.json`.
- Frontend release compilation passed. The production synthesis worker and CSS are byte-identical. Public assets and all MIDI downloads returned HTTP200 with matching SHA-256. Browser checks are recorded in browser-validation.json.

Existing user-facing interface copy is preserved. No new labels, descriptions or tooltips were added.
