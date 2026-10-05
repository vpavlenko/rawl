# Lakh simple-major scan

Run on 2026-10-05 against all 17,266 locally extracted clean Lakh arrangements.

```sh
node scripts/rawl/scan-lakh-simple-major.js
```

Open http://localhost:3000/lakh-simple-major-review.html for searchable results and links to each exact arrangement. Detailed harmonic evidence and failures are in `results.json`. No curated corpus membership is changed.

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
