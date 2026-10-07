# Learned phrase boundaries and annotation feedback

Rawl now uses an actual trained boundary model, rather than only a phrase-length prior. `src/harmony/phraseModel.json` contains the fitted trees, feature schema, annotation snapshot hash and decoder parameters. `phraseBoundaries.ts` runs those trees in both the browser and offline tools. This document describes **phrase boundaries**; the independently trained section-span model is documented in [section-boundary-model.md](section-boundary-model.md). Chord recognition and modulation inference remain separate.

## Supervision and features

The October 7 snapshot contains 3,948 usable annotated MIDI files in 3,883 title/duplicate groups: 515 files have drums. Training uses 2,764 files, validation 404 and the final test 780. There are 366,941 candidate internal bar boundaries and 91,503 annotated positives. These include `f/` local backups and annotated Lakh files, not only the original Lakh evaluation subset.

Targets come from Rawl's cumulative `phrasePatch` semantics, including its implicit four-bar continuation. The fixed beginning and end sentinel are not positive training examples. Saved manual measure grids, excluded voices and drum overrides are respected. The dataset audit lists 208 exclusions: missing/unsupported local MIDI sources, duplicate examples, short/invalid grids and invalid phrase patches. Curated annotations are never repaired or overwritten by the pipeline.

For each possible phrase start, 227 features describe the preceding bar's ending and the following entrance, with surrounding context:

- Drums: six GM instrument groups, 16 subdivisions per bar, late density/acceleration, tom fills, cymbal attacks, next-downbeat attacks, velocity accents and pattern changes against previous bars.
- Pitched voices: aggregate, melody and bass onset patterns; note endings, rests, sustain across boundaries, entrances/exits, density and pitch-class changes, range and melodic motion.
- Repetition: rhythmic, pitch-class and instrumentation comparisons at one-, two- and four-bar lags.

No phrase/section/tonic labels, bar number modulo four or saved phrase shifts are input features. Register-based melody/bass selection is a practical approximation, not a voice-separation model. Drum mapping assumes GM pitch conventions. The offline reader extends notes through sustain; the player parser can yield different note durations. Bar features use normalized elapsed time within the supplied measure grid.

## Fitting and transfer experiment

The teacher is a [histogram gradient-boosted classifier](https://sklearn.org/stable/modules/generated/sklearn.ensemble.HistGradientBoostingClassifier.html): 140 trees, depth at most four and at most 15 leaves per tree. It learns jointly from drum and pitched features. A separate supervised model uses only pitched features. Each piece receives comparable training weight, so long arrangements do not dominate.

The transfer experiment cross-fits three teachers on disjoint training-song groups. For drum-present training examples, their held-out predictions provide 20% soft-target supervision to a pitched-only student; curated labels retain 80%. This implements drum-to-other-voice learning without handing the student an in-sample teacher's memorized answer. **That distilled student did not improve validation performance in this run.** The shipped model therefore uses the joint teacher when drums are present and the stronger supervised pitched model otherwise. The distillation experiment and its measurements remain in the trainer for future refinement.

A dynamic program combines learned boundary scores with a train-only phrase-length distribution and an explicit penalty for every phrase whose length differs from four bars. Lengths from one to 32 bars remain possible. Validation songs choose decoder settings and student variant. The test songs are evaluated after selection and are not refitted. Title normalization and exact MIDI byte duplicates keep known arrangements together across the split. This grouping cannot guarantee identification of differently named transcriptions of the same composition.

Python training dependencies are pinned. The exporter verifies tree inference against scikit-learn `predict_proba` with a maximum probability difference below `1e-10`; inference needs no Python or server model endpoint.

## Four bars as the default

The current artifact is **`phrase-gbdt-82ebee8f69a8`**. The user's four-bar requirement was added by **decoder-only calibration** of the retained `phrase-gbdt-c84d5e4c97c7` trees. No boundary classifier was refitted and no feature/label schema changed.

Each candidate phrase receives:

```text
learned boundary log-odds − boundaryBias
+ lengthWeight × train-only log length frequency
− nonFourBarPenalty if length ≠ 4
```

The fixed first boundary has no learned reward. The DP scores the full segmentation, including its final fragment, so a local high score must compensate for the complete path's additional length costs. The four-bar prior applies to **duration since the preceding chosen boundary**; it does not force measure numbers to be `1 mod 4`. A supported pickup or extension can shift the subsequent four-bar sequence.

`phrasePatch` stores cumulative adjustments: moving the default boundary at bar 5 to bar 6 also moves the following defaults to 10, 14, and so on. Inference uses the same relative-duration semantics, but does **not** greedily commit one shift at a time. The trees score every candidate bar boundary, then the DP finds the best complete path and backtracks its chosen starts. Later evidence can therefore change an earlier boundary. The classifier predicts a boundary score, not a left/right displacement. The file start at bar 1 is fixed; an inferred pickup can add the first internal boundary before the usual bar 5.

Both drum-present teacher and pitched-only student retain `lengthWeight=0.8`, `boundaryBias=-2`, with **`nonFourBarPenalty=2`**. Including the empirical prior, lengths three/five cost approximately 4.7 score units relative to length four. A 3+5 alternative consequently pays roughly 9.4 extra units versus 4+4 before its boundary evidence is considered. Very strong evidence can overcome this cost; it is not an absolute ban on irregular phrases. Probability clipping now uses `1e-6` instead of `.001`, allowing strong evidence against an internal boundary to justify a longer phrase too.

Five shared extra penalties `[2,3,4,5,6]` were compared on the **404 validation files**, using `0.65 × exact F1 + 0.35 × off-grid exact F1`; ties prefer a stronger penalty. All candidates satisfy the user's minimum strong prior. Penalty 2 won; penalties 3–6 progressively reduced boundary agreement. Python/TypeScript decoding matched for **all 404 validation files**. The new artifact version invalidates older phrase sidecars on opening; chord and key caches/search sequences remain usable. The signed-in training export still excludes these predictions.

[Length-prior evaluation](../reports/phrase-model/length-prior-evaluation.json) is the authoritative report for this change. It preserves all candidates, old/new metrics, phrase-length histograms and reference lengths. Completed-phrase histograms include pickups but tabulate the unobserved final file fragment separately. This uses the same previously evaluated split and is a diagnostic comparison, not a fresh untouched test.

| Same 780 test files | Previous decoder | Four-bar default |
| --- | ---: | ---: |
| Completed phrases of length four | 92.34% | **95.24%** |
| Exact boundary F1 | 0.681 | 0.671 |
| Within-one-bar F1 | 0.853 | 0.849 |
| Off-grid exact F1 | 0.616 | 0.597 |

The stronger prior reduces short/long phrase proposals and also misses some genuine shifts: validation exact F1 is 0.680 → 0.657, test drum-present F1 0.739 → 0.723 and pitched-only F1 0.671 → 0.663. The new policy was requested by the user; it is not described as an accuracy improvement. Saved manual annotations are unchanged. Synthetic regressions cover weak/default evidence, isolated spikes, a phase shift followed by four-bar phrases, a one-bar pickup and a strongly supported eight-bar phrase.

The append-only run is [`2026-10-07T08-01-25-255Z-phrases-0ca41330516c-652e27`](../reports/model-training/2026-10-07T08-01-25-255Z-phrases-0ca41330516c-652e27/record.json). It archives the prior trees, all candidate decoder configurations/metrics, real validation fixtures, source files, annotation/data hashes and unchanged-tree hash. Python 3.14.7 and NumPy 2.5.3 were used; scikit-learn is not invoked in this calibration. Future full fits use the same explicit prior with length weights `[.8,1.2,1.8]`, biases `[-2,-1,0]`, penalties `[2,3,4,5,6]` and floor `1e-6`.

```sh
# Reuse frozen trees and the existing feature matrix; no tree refit.
/private/tmp/rawl-phrase-training/bin/python scripts/rawl/calibrate-phrase-length.py --promote
node --test scripts/rawl/harmony.test.cjs
```

Without `--promote`, calibration archives a candidate. Promotion requires validation exact F1 above the fixed four-bar grid and cross-language decoding agreement. Existing weights are preserved in the run archive even when only decoder parameters change. New training runs also import the shared Python decoder, so retraining cannot silently lose this prior.

## Original boundary-model fit

`reports/phrase-model/evaluation.json` preserves the **original `phrase-gbdt-c84d5e4c97c7` fit**, before the stronger length penalty. Boundaries match one-to-one; “exact” means the same measure, without a one-bar allowance.

| Model / test subset                                    |  Exact F1 | F1 within one bar | Off-grid exact F1 |
| ------------------------------------------------------ | --------: | ----------------: | ----------------: |
| Four-bar grid, all 780 files                           |     0.436 |             0.802 |             0.000 |
| Original runtime model, all 780 files                  | **0.681** |         **0.853** |         **0.616** |
| Joint teacher, 96 drum-present files                   | **0.739** |                 — |         **0.757** |
| Pitched-only supervised model, same 96 files           |     0.648 |                 — |             0.676 |
| Pitched-only supervised model, 684 files without drums |     0.671 |                 — |             0.586 |
| Distilled pitched model, all 780 files                 |     0.650 |             0.837 |             0.587 |

The old cached heuristic and new model can also be compared on 55 held-out Lakh files: exact F1 0.606 → 0.765. That comparison is diagnostic because the older length prior used a different training split. The prior harmonic report remains a historical run; its phrase numbers must not be treated as current model accuracy.

These are agreement scores against the supplied corpus annotation convention, including its implicit grid. They do not establish universal musical phrase accuracy or harmonic-search accuracy. Exact errors and off-grid scores matter because the generous one-bar tolerance conceals many phrase shifts.

## Use and feedback loop

Unannotated MIDI files use learned phrases in the provisional score and ribbon by default, with an automatically generated analysis notice above the score. Opening an annotated result with `harmony=1` explicitly requests the same preview. Live recalculation uses the same model. Old chord/key sidecars are upgraded on loading if their `phraseModelVersion` differs; `refresh-lakh-phrases.cjs` materializes the new phrases and proposals throughout Lakh without changing chord search sequences. Previewing and downloading predictions do not save them as training labels.

The length-prior metrics evaluate the phrase decoder itself. Rawl's existing proposal converter additionally inserts independently inferred section starts into `phrasePatch`, because section indices refer to phrase starts. Those additional starts are not selected by this phrase DP and can introduce shorter displayed phrases. The independent section model and this representation constraint have not been changed by the decoder calibration.

Correct annotations in the ordinary saved-analysis view. When signed in, **Export phrase training labels** exports the checked-in curated corpus plus your own saved annotation versions. Other users' annotation versions and provisional predictions are excluded. Feed that snapshot into the preparer; it records its content hash. Retrain and promote only after validation, then refresh corpus proposals. This is an explicit offline training loop, not an automatic browser retrain on every edit.

`reports/phrase-model/review.json` contains training-only disagreements with direct score links. They are candidates for review, not declarations that the annotation is wrong. The trainer can generate out-of-fold teacher disagreements; `review-phrase-model.cjs` instead generates a small queue from the fitted runtime model, explicitly marked in-sample. Validation/test songs stay out of the feedback queue. If they are reviewed to guide model changes, reserve a fresh untouched holdout before claiming another unbiased test result.

```sh
python3 -m venv /private/tmp/rawl-phrase-training
/private/tmp/rawl-phrase-training/bin/pip install -r scripts/rawl/phrase-training-requirements.txt

# Defaults to src/corpus/analyses.json; optional --annotations is the UI export.
node scripts/rawl/prepare-phrase-training.cjs --annotations /path/to/phrase-training-labels.json
/private/tmp/rawl-phrase-training/bin/python scripts/rawl/train-phrase-model.py --promote
node scripts/rawl/review-phrase-model.cjs
node scripts/rawl/refresh-lakh-phrases.cjs --workers 4
node --test scripts/rawl/harmony.test.cjs
./node_modules/.bin/tsc --noEmit --pretty false
```

Without `--promote`, the candidate model remains beside the temporary training dataset. Promotion requires validation improvement over the four-bar grid. No command starts the development server or modifies curated labels.

Every completed run also creates an append-only [training record](model-training.md), including all fitted variants, labels, feature/source snapshots, configuration and evaluation. Earlier records remain available when data or features change.
