# Learned phrase boundaries and annotation feedback

Rawl now uses an actual trained boundary model, rather than only a phrase-length prior. `src/harmony/phraseModel.json` contains the fitted trees, feature schema, annotation snapshot hash and decoder parameters. `phraseBoundaries.ts` runs those trees in both the browser and offline tools. Chord recognition, modulation inference and section suggestions are separate; this change trains **phrase boundaries**.

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

A dynamic program combines learned boundary scores with a train-only phrase-length distribution, allowing lengths from one to 32 bars. Validation songs choose length weight, boundary bias and student variant. The test songs are evaluated after selection and are not refitted. Title normalization and exact MIDI byte duplicates keep known arrangements together across the split. This grouping cannot guarantee identification of differently named transcriptions of the same composition.

Python training dependencies are pinned. The exporter verifies tree inference against scikit-learn `predict_proba` with a maximum probability difference below `1e-10`; inference needs no Python or server model endpoint.

## Measured results

`reports/phrase-model/evaluation.json` is the authoritative evaluation. Boundaries match one-to-one; “exact” means the same measure, without a one-bar allowance.

| Model / test subset                                    |  Exact F1 | F1 within one bar | Off-grid exact F1 |
| ------------------------------------------------------ | --------: | ----------------: | ----------------: |
| Four-bar grid, all 780 files                           |     0.436 |             0.802 |             0.000 |
| Shipped model, all 780 files                           | **0.681** |         **0.853** |         **0.616** |
| Joint teacher, 96 drum-present files                   | **0.739** |                 — |         **0.757** |
| Pitched-only supervised model, same 96 files           |     0.648 |                 — |             0.676 |
| Pitched-only supervised model, 684 files without drums |     0.671 |                 — |             0.586 |
| Distilled pitched model, all 780 files                 |     0.650 |             0.837 |             0.587 |

The old cached heuristic and new model can also be compared on 55 held-out Lakh files: exact F1 0.606 → 0.765. That comparison is diagnostic because the older length prior used a different training split. The prior harmonic report remains a historical run; its phrase numbers must not be treated as current model accuracy.

These are agreement scores against the supplied corpus annotation convention, including its implicit grid. They do not establish universal musical phrase accuracy or harmonic-search accuracy. Exact errors and off-grid scores matter because the generous one-bar tolerance conceals many phrase shifts.

## Use and feedback loop

Opening a result with `harmony=1` uses learned phrases in the provisional score and ribbon. Live recalculation uses the same model. Old chord/key sidecars are upgraded on loading if their `phraseModelVersion` differs; `refresh-lakh-phrases.cjs` materializes the new phrases and proposals throughout Lakh without changing chord search sequences. Previewing and downloading predictions do not save them as training labels.

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
