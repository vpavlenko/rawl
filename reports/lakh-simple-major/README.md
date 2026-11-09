# Lakh simple-major scan

## Current stages (October 7)

Stages now use the same `segmental-2` chord analysis as the score ribbon, with
the `simple-major-segmental-2` stage policy. **V7 belongs with I and V at
Stage 1.** Adding IV, vi, ii, iii/vii or a different seventh/extension determines
the higher stage. V7 remains a seventh in harmonic searches and score labels;
only its pedagogical difficulty changes.

Recompute the 207 curated `/f/` pieces and scan all 17,266 Lakh arrangements:

```sh
node scripts/rawl/recompute-simple-major-stages.cjs --workers 4
node --test scripts/rawl/simple-major-segmental.test.cjs scripts/rawl/sort-simple-major.test.js scripts/rawl/scan-lakh-simple-major.test.js
```

The wrapper records stage counts, changed/added/removed arrangements, per-file
MIDI hashes, annotation/source/output hashes, failures and fallbacks under
`reports/simple-major-stages/`. `--baseline-ref COMMIT` compares with a committed
stage snapshot; it reads those files without restoring anything in the worktree.
Both flat `/f/` ordering and Lakh stage lists are regenerated. Saved source MIDI
and annotations are untouched. This is inference and categorization, **not model
training**. The first October 7 trial predates the user's V7 policy; its audit is
preserved separately from the final refresh.

Cached Lakh chords are accepted only when their harmony version, MIDI SHA256 and
annotation-settings fingerprint match; other cases are analyzed from MIDI.
Saved tonics/manual grids guide Roman degrees. Unannotated files retain the
existing conservative major-key membership screen and its local-key proposals.
Curated harmonic tags and explicit chord reviews take precedence.

Stage votes require chord evidence >=0.60, at least 1.5 quarter-note beats and
3.5% of recognized duration. Root evidence is capped by its actual MIDI duration.
Sevenths require root/third/seventh support within two octaves of the local bass,
at least half a beat per contributing segment, and the same duration threshold.
Inverted V7 voicings therefore count, while a brief melody note is not credited
as a whole segment of seventh harmony. This is a conservative voicing check;
widely spaced/rootless voicings and uncertain chord segmentation can be missed.
Verified sparse bass/power-chord evidence remains available. Below 50% supported
coverage, the legacy estimator (with the same V7 rule) or prior category is
retained and recorded explicitly. Generated labels remain provisional.

Popularity stars follow previously curated works across stage changes. Headers
show the actual number of marked works, rather than promising five/ten after
reclassification. No new popularity ranking is inferred.

## October 5 baseline

Run on 2026-10-05 against all 17,266 locally extracted clean Lakh arrangements.

```sh
node scripts/rawl/scan-lakh-simple-major.js
```

Open http://localhost:3000/lakh-simple-major-review.html for the latest searchable results and links to each exact arrangement. Detailed current harmonic evidence and failures are in `results.json`. The table below describes the historical October 5 baseline. No curated corpus membership is changed.

| Category | Arrangements |
| --- | ---: |
| I and V only | 12 |
| Adds IV | 106 |
| Triads with vi | 104 |
| Triads with ii | 154 |
| Triads with iii or vii diminished | 199 |
| Seventh chords and extensions | 33 |

608 candidates: 265 strict tonic-ending matches, 332 candidates from the relaxed ending tier, 1 manually reviewed match, and 10 inferred truck-driver modulation candidates. 16,420 exclusions, 6 harmonically inconclusive files, and 232 parsing/note-reconstruction failures account for the rest. All failures have a recorded reason; 151 contain unterminated pitched notes. Scan took 133 seconds with four workers.

The strict tier reuses the existing major search, allowing brief stepwise chromatic ornaments but rejecting chromatic harmony. The relaxed tier requires a major duration-weighted key profile with a correlation lead of at least 0.04 over the next major/minor key, then applies the same chromatic checks without requiring the final bass to be the tonic. Saved key regions are normalized before estimating harmony. Reviewed labels retain provenance and raw estimates.

These are candidates, not a definitive transcription or a complete list of diatonic major music. Key profiles, inversions, passing bass notes, texture selection, and endings can produce false positives or negatives. Harmonic rhythm is measured in MIDI quarter-note beats, not bars; reported interval support is not an overall classification confidence. Numbered arrangements remain separate. La Bamba's reviewed arrangement is not conflated with La Bamba.1.

Verification: major-search regressions, harmonic-sorting regressions, key-profile and rich-texture scan regressions; Chrome verified the completed report, text filtering, La Bamba's stage and exact arrangement links, and absence of console errors.

The modulation-aware rescan retained all previous 598 candidates and recovered 10 arrangements listed in `truck-driver-additions.json`. Unannotated semitone/whole-tone lifts require two consecutive 16-beat blocks supporting each local major key, then refine the boundary to a MIDI note onset. Each local section still passes the diatonic/ornament checks before its notes are normalized for harmonic ranking. Brief secondary dominants and minor destinations are covered by negative regressions. This remains conservative: shorter or ambiguous local keys and other modulation types may still be missed.
