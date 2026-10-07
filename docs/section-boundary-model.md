# Learned section boundaries

`src/harmony/sectionModel.json` contains a fitted histogram gradient-boosted binary classifier: 100 trees, maximum depth four, maximum 15 leaves, learning rate 0.08. A training example is a candidate **whole section span**, with a label indicating whether both endpoints match one annotated section. The classifier minimizes log loss; a semi-Markov dynamic program chooses a complete partition of the MIDI from its candidate-span scores. This is a supervised span scorer with a structural decoder, not a neural representation of the piano roll.

## Annotation and split

Training is restricted to `/f/`. The 2026-10-07 snapshot yields 3,518 usable files / 3,472 groups: 2,441 training files, 367 validation files and 710 test files. It contains 213 drum-present files (153 / 17 / 43 by split). Training has 18,459 positive section spans and 470,312 hard/random negative candidates. Song weights prevent long pieces from dominating.

`Analysis.sections` contains phrase indices. The preparer converts them through the audited cumulative `phrasePatch` starts; the phrase labels then serve only to recover **targets**, not input features or candidate restrictions. It respects the manual MIDI grid, excluded voices and drum overrides. Of the 3,640 locally backed `/f/` files in the phrase manifest, 42 have no section annotation and 80 have invalid, out-of-range or non-increasing section references. Their keys and reasons are recorded in `reports/section-model/dataset.json`; source annotations remain unchanged. Earlier phrase-preparation exclusions also remain applicable.

The existing phrase dataset's title/byte-duplicate grouping and train/validation/test splits are reused. Known arrangements stay together; differently named transcriptions are not guaranteed to be identified. MIDI and annotation hashes are verified. No predicted phrases, sections or curated tonics are classifier inputs.

## Features and decoding

The extractor has 213 features, shared verbatim between the training exporter, evaluation scorer and browser:

- **Visual similarity:** multiset intersections of MIDI pitch + onset, pitch + onset + duration, and rhythm alone. Onsets have 16 subdivisions per bar; duration uses the same bar-normalized resolution. Dice and coverage normalization prevent sheer note density from winning. A bounded one/two-bar displacement also captures shifted repetition. Candidate spans compare with immediately preceding and following windows of the candidate's length, clipping at file edges. These windows are hypotheses, rather than the actual differently sized adjacent rows ultimately chosen by the decoder.
- **Length:** bars, log length, fraction of the piece, and first/last-section indicators. Trees learn which lengths are plausible. A train-only length histogram is available as an additional decoder penalty, but validation chose weight zero for the full model: its learned length features already performed better without that extra penalty.
- **First/last-bar events:** pitched-note counts in four subdivisions, onset pitch-class intervals relative to the onset bass, beginning/end harmony roots and qualities, harmonic change counts including the late half-bar, and drum groups/acceleration/accents in the first and last bars. Subdivisions are normalized elapsed bar time, not literal beats in every meter.
- **Ending context:** aggregate, register-selected melody and bass note endings, rests, sustain, density, movement to the next entrance, voice entrances/exits and contextual novelty. Drum fills, toms, cymbals and following downbeat attacks are represented separately. Explicit drum availability prevents missing percussion from being equated with a weak percussion cadence.
- **Cadence coincidence:** interactions between an estimated tonal ending, melodic rest/length and late drum activity. Harmony comes from quarter/eighth-bar pitch-duration histograms, chord templates and local major/minor key profiles, independently of saved tonic labels. These are musical proxies whose usefulness is learned from labels; they are not ground-truth chord or melody annotations.

Hard negatives shift a true start/end, split or merge annotated sections, or choose unrelated spans. The decoder considers every bar as a possible boundary, internal lengths 1–64, 96 and 128 bars, and any final-tail length. Fifteen annotated internal spans across the usable dataset lie outside this candidate set; evaluation includes those files. The final row is not forcibly chopped simply for being long.

Validation chooses feature family, per-section bias and histogram weight by exact boundary F1. The selected full model uses section bias -3 and length weight zero. Scores of selected spans are not calibrated probabilities of globally selected boundaries. The exported trees exactly reproduced scikit-learn probabilities on the export check (maximum error zero); TS and Python decoders produced identical partitions for all 710 test files.

## Held-out results

`reports/section-model/evaluation.json` contains counts, precision/recall and ablations. Exact matching requires the same bar; the start of the file is excluded. Configuration was frozen before test scoring, with no test refit.

| Variant                                        | Validation exact F1 | Test exact F1 | Test F1 within one bar |
| ---------------------------------------------- | ------------------: | ------------: | ---------------------: |
| Length only                                    |               0.222 |         0.174 |                  0.318 |
| Note similarity + length                       |               0.355 |         0.342 |                  0.469 |
| Full, with beginning/ending events and cadence |           **0.487** |     **0.485** |              **0.550** |
| Eight-bar grid                                 |                   — |         0.178 |                  0.314 |
| Previous harmony/texture novelty heuristic     |                   — |         0.060 |                  0.078 |

The full model matched 3,010 of 4,600 reference internal boundaries, but predicted 7,803: precision **0.386**, recall **0.654**. It oversegments. Exact F1 is 0.445 on 43 drum-present test files and 0.488 on 667 without drums. The ablation demonstrates the collective value of additional event/cadence features; it does **not** isolate a causal contribution of percussion, harmony or melody individually.

This validates agreement with `/f/` section annotations. It does not establish Lakh domain-transfer accuracy, harmonic-search accuracy, or form labels such as verse/chorus. Register-based melody selection, GM drum assumptions and template harmonies remain approximations. The offline MIDI reader extends notes through sustain, whereas the player parser uses physical note-offs; this can affect duration/rest features and selected boundaries. For example, Chopin Military Polonaise produces 15 section suggestions offline and 17 from the current browser notes. Unifying those note representations remains necessary before claiming identical offline/live predictions.

## Use and retraining

`harmony=1` uses these sections in the provisional score layout and ribbon. Recalculation uses the same artifact. Loading a Lakh sidecar upgrades structural inference when `sectionModelVersion` differs, preserving cached chords/keys. Newly built harmonic sidecars store the section model version. This change does not materialize new sections in all existing Lakh assets; it computes them when files open. Saved annotations are never overwritten by the preview.

The existing signed-in **Export phrase training labels** action exports complete analysis objects, including sections, from the curated corpus plus the current annotator's saved corrections. It excludes other users and inferred previews. Regenerate the phrase grouping manifest from the same snapshot before section preparation; this ensures current phrase-index conversion and provenance. Retraining is explicit and offline.

```sh
# Uses the same pinned environment as phrase training.
# Optional: add --annotations /path/to/phrase-training-labels.json to both preparers.
node scripts/rawl/prepare-phrase-training.cjs
node scripts/rawl/prepare-section-training.cjs
/private/tmp/rawl-phrase-training/bin/python scripts/rawl/train-section-model.py fit
node scripts/rawl/score-section-model.cjs --split validation
/private/tmp/rawl-phrase-training/bin/python scripts/rawl/train-section-model.py select
# Parameters are now frozen; open the test set after selection.
node scripts/rawl/score-section-model.cjs --split test
/private/tmp/rawl-phrase-training/bin/python scripts/rawl/train-section-model.py test --promote
node --test scripts/rawl/harmony.test.cjs scripts/rawl/sections.test.cjs
./node_modules/.bin/tsc --noEmit --pretty false
```

Future model selection should use validation/training feedback. If reviewing test disagreements guides feature changes, reserve a new untouched holdout before claiming a new unbiased test result. Next improvements are joint comparison of actual neighboring rows with unequal lengths, consistent note-off/sustain handling, and separate cadence ablations with more drum-present section labels.

`fit` and `test` automatically create append-only [training records](model-training.md). Fit records preserve all ablations; test records add the frozen selection and evaluation. Keep these records when adding annotations or changing features.
