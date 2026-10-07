# Verification — October 7, 2026

All 42 contact sheets covering the 148 case figures were visually inspected. Every figure contains all versions' whole-file overview and quarter-note beats 32–64. This is not a bar-by-bar or listening validation; excerpts are not phrase-aligned. Two corrupted alternatives remain unreadable, as listed in `manifest.json`.

Artifact validation: 148 observations joined to stable case IDs and unchanged annotated selection keys; 572 version rows; all 148 linked files have PNG signatures. Gallery assembly, Python syntax checks and Node syntax checks passed. Phase diagnostics were reproduced by `diagnose-lakh-version-grid.py`.

Chrome, existing `localhost:3000`, through ChatGPT computer/browser tools:

- Gallery loaded case 83 with all five source links and its comparison image (natural size 1860 × 687).
- Search for Palladium produced one case / two versions. Search with no matches cleared observations and links, hid the figure, and disabled navigation.
- Counterexample filter produced six cases. Switching back restored all 148 options.
- Keyboard activation of Next and Previous changed 83 → 84 → 83. The parties/event details disclosure opened and closed using Enter.
- Selected `All_My_Loving_4` source link destination loaded in Rawl with melody, two guitar voices, bass and drums. Autoplay was paused; the player displayed Resume. No audio content was evaluated.
- Fresh gallery and Rawl warning/error console reads were empty.

Verification limit: CDP mouse input timed out; keyboard controls worked. Both normal and clipped tab screenshot capture timed out. Native Chrome screenshot captured another active window, so it is not accepted as gallery proof. The gallery's final screen appearance in Chrome is not fully verified; the plotted figures were inspected directly from disk. No screenshot of an unrelated window is included as evidence.

The version-ranking test suite passed all nine tests and `tsc --noEmit` passed during this turn. Scoped `git diff --check` passed; the full check reports existing trailing whitespace at `src/components/rawl/corpora/corpora.tsx:5936,5938`, which was preserved. No Lakh component imports the candidate scorer; corpus rankings are retained under `reports/`, and no recommendation UI was deployed. No new fit followed the visual review.
