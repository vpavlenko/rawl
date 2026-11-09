# Kuhlau movement-boundary bar alignment

Source: https://musescore.com/user/9292486/scores/167583

Rawl record: `midis/xSTLKcNxhPkD1uKyCkMj`, slug `piano-sonatina-in-c-major-op-20-no-1-by-friedrich-kuhlau`.

## Cause and repair

The MIDI has 480 ticks per quarter note. Before the Andante pickup at tick 213360, MuseScore inserts a silent 240-tick pause at tick 213120 with a tempo of 6,000,000 microseconds per quarter. The pickup is explicitly 1/8 and the first complete Andante bar at tick 213600 is explicitly 6/8. The preceding 4/4 signature does not describe the short pause. Rawl's beat accumulator carries the fractional quarter into the new eighth-note meter, displacing subsequent barlines. Equivalent pauses occur at ticks 247920 and 259680.

`normalizeMidiMeasures` encodes the length of the final incomplete bar before an explicit time-signature boundary. For this file it adds exactly three 1/8 signature events, at ticks 213120, 247920, and 259680. No original event is removed, reordered, or moved. Notes, velocities, controllers, tempo events, and track endings are unchanged. Pauses and pickups remain separate short measures; this repair does not renumber movements to match printed score numbering.

The shared normalizer runs before MIDI saving (including MuseScore link imports and file uploads) and before playback transformation (existing records). It returns exact original bytes when no repair is needed. It preserves the preceding beat unit where possible, supports duplicated consistent signatures, and is idempotent. Conflicting simultaneous meters, format-2 independent sequences, SMPTE timing, and boundaries not exactly representable through 1/128-note units are left unchanged. MIDI without explicit boundary metadata cannot identify a double bar or a same-meter movement pickup reliably; that case requires score metadata or manual adjudication.

## Publication and validation

`before.json` and `original.mid` preserve the original record and bytes. `fixed.mid` is the repair. `apply.cjs --publish` guards against unexpected concurrent blob changes, updates only this record's blob, and reads it back to verify exact bytes and unchanged other fields. `validation.json` records both hashes and publication status.

Checks:

- `node --test scripts/rawl/normalize-midi-measures.test.cjs`: seven passing tests, including the complete Kuhlau event comparison and production reader grid.
- `node scripts/rawl/check-midi-ports.cjs`: parsing, synthesis, mute, drums, seeking, and hand splitting passed.
- `tsc --noEmit --pretty false`: passed.
- Public Chrome reload: the pickup occupies its short bar and the first full Andante bar starts at the following boundary. No captured console warnings or errors. See `public-chrome.png`.
- Local Chrome at `http://localhost:3000`: compiled successfully, imported `original.mid` through the native file picker, and verified that the unchanged source is repaired during playback transformation. The resulting grid has 308 measure labels and the Andante pickup/full-bar boundary is aligned. No captured console warnings or errors. See `local-import-chrome.png` and `andante-detail.png`. No duplicate Firebase record was saved. The general importer implementation remains local; the specific Kuhlau blob repair is already public.
- Server startup reported existing Node/Webpack deprecations and an outdated Browserslist database; compilation still succeeded.
- Unrelated existing trailing whitespace in `corpora.tsx` causes an unscoped `git diff --check` failure. Changed tracked implementation paths pass the scoped check.

An initial invocation of the MIDI-port check incorrectly supplied the two-voice Kuhlau file to its optional fixture slot, which specifically asserts 33 independent voices. The standard invocation above passed.
