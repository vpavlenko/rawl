# React 19 and shared Rawl integration

This integration lives in the isolated `codex/librawl-foundation` worktree based
on Rawl commit `c5c9bb0407534d9b7eb9a8267078c006fa340ee6`. It does not itself
merge into the original checkout or publish rawl.rocks.

## Current shared audition release (0.3.4)

Rawl pins `vendor/librawl-0.3.4.tgz`, source commit `ed851c4`.
SHA256: `43b61397c67d338612896021c1c89305dbda476d17d7aba031a906f414f423c1`.
The existing Shift-hover branches now use `createShiftHoverAudition` from
`librawl/native`; Rawl retains its own note audition function and all existing
editing, cents, drum and Qanun behavior. The helper auditions one shifted
entry per visit and ignores moves. Leave and source lifecycle changes reset
that visit.

The shared package passes 71 tests. Rawl passes all 58 focused tests, TypeScript
with zero errors, four playback gates and the worklet sync check. An actual
WASM synth regression holds one note while changing speed four times: source
time advances with no new note-on, note-off, panic or reset calls. Rawl's
native rate path already changes speed continuously; its synthesis remains
host-owned. Evidence: [`librawl-gesture-tempo-034.json`](../evidence/librawl-gesture-tempo-034.json).

## Note-tooltip release (0.3.2)

Rawl pins `vendor/librawl-0.3.2.tgz`, public tag `v0.3.2` / commit
`61cfdd8`. SHA256: `22c90894ee055808df3c56fb66c7339a7862bd3b3f38b8bfbd32a9900b995ea7`.
The shared native renderer removes individual note titles, including titles
supplied by host adapters. Accessibility labels, source attributes, note
interactions and playback height doubling remain unchanged. Both locks and
all 49 installed package files match the frozen archive. The output worklet
remains byte-identical.

Node 24.12.0 verification passes TypeScript with zero errors, all 50 focused
tests without skips, all four playback gates and worklet synchronization.
The library itself passes 56 tests across React 16 and React 19.
Chrome on the original localhost:3000 app verified 817 note elements without
individual or descendant titles, playback advancing through 17 seconds, and
6px/12px playback height doubling. The authorized `npm run deploy-lite`
completed from the clean worktree; public HTML, manifest, main bundle, note
chunk, stylesheet and output worklet match local release bytes. The unrelated
untracked whitepaper draft was preserved and excluded from the release.

Current release evidence: [`librawl-note-tooltips-032.json`](../evidence/librawl-note-tooltips-032.json).
The earlier integration history and browser scope below remain unchanged.

## Runtime and library boundary

- React and React DOM are pinned to `19.3.1`; styled-components is `6.6.0`.
  The root uses `createRoot`. The DOM prop filter preserves the previous
  styled-components filtering behavior.
- `vendor/librawl-0.3.0.tgz` is the reviewed library artifact. Its SHA256 is
  `0678d2340f1d4ecd4fb597156227e6f3a60ec5d141019dc9b39588ea44b78b65`.
  npm and Yarn locks agree with its SHA512 integrity.
- Note rendering, native playback contexts, section clocks, pitch-bend and
  quartertone helpers, pitch colors, voice shapes and tonic flag primitives now
  come from `librawl`. The host bridge modules import the same public native
  entry so contexts keep one runtime identity.
- The UI-facing threaded MIDI transport and consumed-PCM clock come from
  `librawl/native-audio`. The host supplies its existing worker constructor,
  asset base, EventEmitter and browser constructors. The output worklet remains
  byte-identical to the reviewed original.
- The host still owns its sequencer/synth worker, WASM, soundfonts, MIDI parsing,
  app state, navigation, saved annotations and analysis orchestration. No
  synthesis backend or persistent-state format is replaced.
- Both Webpack configurations transform the upgraded dependencies and `.cjs`
  modules instead of emitting library code as asset URLs. Legacy entry shims
  consistently select ESM. Both configurations resolve the shared voice-shape
  CSS; the duplicate rules were removed from `src/index.css`.
- `scripts/rawl/sync-librawl.cjs` verifies the output worklet during startup and
  builds. It refuses an unreviewed divergent host worklet rather than silently
  replacing it.

## Verification on 2026-11-17

The final source passed all of these checks under Node `24.12.0`:

```sh
node_modules/.bin/tsc --noEmit
node --test scripts/rawl/note-cents.test.cjs \
  scripts/rawl/normalize-midi-measures.test.cjs \
  scripts/rawl/note-rendering.test.cjs \
  scripts/rawl/original-audio.test.cjs \
  scripts/rawl/quartertone.test.cjs \
  scripts/rawl/rhythm-grouping.test.cjs \
  scripts/rawl/score-auto-scale.test.cjs \
  scripts/rawl/sections.test.cjs
node scripts/rawl/check-playback-index.cjs
node scripts/rawl/check-midi-output.cjs
node scripts/rawl/check-first-measure-seek.cjs
node scripts/rawl/check-midi-ports.cjs
node scripts/rawl/sync-librawl.cjs --check
git diff --check
```

TypeScript reports no errors. All 49 focused tests pass without skips. The four
playback gates pass, including actual WASM port isolation, synthesis, muting,
drums, seeking, controller state and hand splitting. The optional external MIDI
fixture argument was not used. Package verification also checks the tar hash,
both lock integrities, installed versions, both stylesheet aliases and exact
voice-shape stylesheet bytes.

## Shared tempo keys (0.3)

The exact artifact is 236909bytes, pinned to public librawl commit `3999bc3c0e920b15cc4a7faf5366dcfc5e9ceced`.
Its SHA512 integrity is `sha512-F+b7RMfqgyvcH8+4IUEBQX99D9U/UtaV/n2UAu4cJb76KjI1X+raR14OGkWLtn8tTdEk+m+UWav9OCXgnzqIHQ==`. Every installed dist artifact
matches the frozen tar. npm and Yarn lock integrities agree.

`App` uses `bindTempoKeys` from `librawl/audio`; the separate four switch cases
are removed. `-`/`=` retain the original ±0.1 speed steps, and `_`/`+` retain
±0.01. The existing `setSpeedRelative` setter preserves its0.1–4bounds and
updates both the MIDI and original-audio paths. Global shortcut disabling,
editable controls, modifiers and the shortcut modal are excluded. Unmount
calls the returned disposer; remount does not retain an old handler.

Six checks execute the actual App binding/lifecycle code. The final0.3source
also passes TypeScript, all49focused tests, the four playback gates and the
worklet sync check. Browser verification of the shared shortcuts and the final
production release remain parent-owned; the prior0.2Chrome evidence follows.

## Prior Chrome verification (0.2)

Before the subsequent 0.3 tempo-key migration, root verified the candidate on port 3100 against the existing port-3000 app on
`/f/all-the-things-you-are`. A fresh reload with DevTools closed produced the
same `91.71702` time-spacing value, full-width note grid, colors, voice shapes
and modulation flags. The earlier narrow layout was the existing stale-viewport
fit after loading with DevTools open; no source change was made for it.

The candidate retained all four voices. Playback advanced through `0:01`,
`0:17`, `0:25` and later `0:40`; pause and resume worked. Tempo was changed from
`1x` to `1.1x` and restored, transposition from zero to `+1` and `+2` and restored,
and the vibraphone voice was muted and restored. The fresh console had no new
application exception. Observed messages were the development SockJS unload
permission violation and the existing WASM invalid-generator/autoplay warnings.

This is one standard and a scoped interaction check, not a review of every
piece. Human listening, corpus-wide browser coverage, quartertone/drum browser
examples, saved-state workflows, the full responsive-layout matrix and
production deployment remain outside these results. Source/protocol and focused
tests cover those rendering and MIDI mechanisms separately; they are not a
claim of browser or listening coverage. Use the existing repository
`npm run deploy-lite` for an authorized Rawl deployment; `build-lite` is not a
verification command.

Machine-readable results and audited source fingerprints are recorded in
[`evidence/librawl-integration.json`](../evidence/librawl-integration.json).
