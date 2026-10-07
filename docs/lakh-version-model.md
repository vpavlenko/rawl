# Lakh version preferences: visual audit and model experiments

## Visual review before the next fit

Reviewed all **148 multi-version groups with saved annotations: 572 files**. Every readable version was inspected in a whole-file piano roll and a larger excerpt at quarter-note beats 32–64. Two alternatives fail MIDI parsing. No audio was listened to and excerpts were not aligned to corresponding musical phrases. These are analyst hypotheses about the user's choices, not user-confirmed explanations or new training labels.

- [Interactive comparison gallery](http://localhost:3000/lakh-version-review/index.html?case=83)
- [Observation for each of the 148 cases](../reports/lakh-version-model/visual-review/review.md)
- [Coverage and input hashes](../reports/lakh-version-model/visual-review/manifest.json)
- [Editable human observations](../reports/lakh-version-model/visual-review/observations.json)
- [Event comparisons](../reports/lakh-version-model/visual-review/event-comparisons.json) and [phase diagnostics](../reports/lakh-version-model/visual-review/grid-diagnostics.json)

There are 40 cases with a visible distinction, 66 where a family of arrangements seems plausible but the exact file is unclear, 24 with no established reason, six counterexamples to simple rules, nine with multiple annotated versions, two with an unreadable alternative and one with byte-identical alternatives. These categories describe the audit's uncertainty, not calibrated model confidence.

The likely preference is **useful, legible musical roles and a recognizable arrangement**, with completeness and timing interpreted within the same composition. Raw complexity is an unreliable substitute:

| Observation | Consequence for features |
| --- | --- |
| All My Loving.4 has five channels and the fewest notes among its alternatives; distinct upper melody, guitar pulse, bass and drums remain visible. Captain of Her Heart uses seven channels/4,503 notes rather than fourteen/8,470. | Count independent melodic, bass, rhythmic and accompaniment roles; discount doubling and redundant material. Do not require scores to increase with every extra voice/note. |
| Eleanor Rigby.4 retains four string voices among much larger arrangements. Colors of the Wind retains three clear voices versus a sixteen-channel alternative. | Measure whether the characteristic texture and principal lines are represented. A melodic candidate is not yet proof that the sung melody is present. |
| Brain Damage, Time, Roxanne and Tom's Diner include selected piano arrangements. Waterloo and several other groups differ principally in patches. | More GM programs/families does not establish better timbres. Evaluate instrument suitability for each role and listen using Rawl's actual synth/banks. |
| Ice Ice Baby has a selected full-length arrangement versus a short excerpt; Eternal Flame.9 has more complete visible form. Other selected files have long silent ends or diagnostically extended notes. | Compare musical coverage after alignment. Distinguish missing sections from intros, tempo scales, silence and parser artifacts; maximum duration is not a quality target. |
| I Shot the Sheriff versions use different beat/tempo scales. Some selected files already have manually corrected grids. | Native subdivision error does not measure the effort needed to produce a usable musical measure grid. Consider tactus, downbeat phase, pickup, meter and correction effort separately. |

In Palladium, the selected version has only **4.0%** of pitched onsets close to the native straight-sixteenth/triplet grid. A single global phase correction of **0.1479 quarter-note beats** raises this to **91.4%**. The old feature primarily penalizes an origin offset here. This diagnostic searches the same file in sample; it does **not** determine musically correct bar placement. Eye in the Sky improves from 24.1% to 63.0%; Grapevine from 13.2% to only 32.6%, so a constant shift does not solve every case.

**51 groups** have an alternative with at least 98% agreement of onset/pitch events after integer shifts of ±8 quarter-note beats. This comparison rounds onsets to 1/24 quarter note and ignores duration, voice identity, velocity, programs, banks, controllers and tempo. It does not prove equivalent playback. Such files should be audited for meaningful timbral/timing differences before treating each as a hard negative. Accepting them all as ties automatically would also be unjustified.

The current gallery uses annotation presence to mark selected versions. The user says some choices followed comparison of all alternatives, but saved analyses have no independent “all alternatives reviewed” flag. Multiple annotations may mean multiple acceptable choices, an earlier revision, or another purpose. This distinction needs explicit preference provenance. No saved annotations were changed by this audit.

## Preliminary ranking in Lakh

The user's subsequent request enables the retained **`lakh-version-gbdt-165c23d46053`** as a preliminary browsing order. This is a deployment of existing scores, **not a retraining run or a new accuracy result**. The research limitations below still apply.

- The user's manually annotated version leads and remains the title link. If several versions are annotated, their existing catalog order is preserved.
- Unannotated versions follow in descending model score. Every song title is a link to the leading version. Titles have no `auto` badge; ranking evidence remains available in the tooltip. Original filename/version numbers stay unchanged, so e.g. `1 5 2 0 4 3` means a quality ordering of those existing files.
- Equal scores preserve existing catalog order; versions without scores follow scored versions. Single-file songs still link directly. Missing ranking data preserves manual choices and catalog order with an explicit status message.
- The same ordering applies to artist album/plain lists, Lakh/global song search, direct links for single-song artists, and the Lakh candidates in Simple Major. Existing annotation colors and title-level popularity markers are retained.

The model combines 148 absolute/within-song descriptors: named vocal/lyrics evidence and melodic-line candidates, arrangement voices/notes/density/diversity/duplication, native-grid timing/tempo/meter, instrument/controller metadata and MIDI integrity. This does not verify that a candidate is the sung melody, that the bar origin is musically correct, or that the timbres sound good. It is the existing learned scorer, not a new count-only heuristic or a guaranteed best-file selection.

`node scripts/rawl/index-lakh-version-rankings.cjs --deploy` serves `public/lakh-version-rankings.json.gz`: **10,725 readable files in 3,534 multi-version groups**, 775,599 compressed bytes. Before writing it, indexing checked the current catalog hash and read-back verified every scored MIDI SHA256 against the feature extraction snapshot. The 66 extraction errors retain no score and fall back after readable alternatives. Scores/weights exactly match the retained experiment. [Deployment metadata](../reports/lakh-version-model/deployment-index.json) records the command, catalog/input/output hashes and unchanged-model scope; prior training/withdrawal records remain untouched.

## Preserved first experiments and earlier withholding

The initial preference models were research candidates and their UI recommendations were initially withheld. The retained GBDT now supplies the preliminary order described above by user request. The corpus scores also remain under `reports/` for comparison. Visual review happened after those fits and does not retroactively improve their metrics.

Dataset: 3,534 multi-version groups / 10,725 usable files, with 66 extraction errors. Provisional labels cover **136 groups: 88 train, 31 validation, 17 test**. Twelve annotated groups were excluded: nine ambiguous multi-annotation groups, one all-identical group and two with parsing failures. Exactly matching winner bytes are accepted together. Files are deduplicated by bytes during fitting, and each song contributes equal positive/comparison weight.

Groups normalize artist aliases, title punctuation/case and numbered filename suffixes. Shared normalized titles across artists and byte duplicates are united before splitting; SHA256 of the split representative modulo five assigns 0=test, 1=validation, remainder=train. The audit found **Billie Jean / Billy Jean** still separated: they happen to share the current training split, but canonical identity must be repaired and split migrations recorded before the next dataset. Musical near-duplicates need further identity/alignment review. Frozen archives retain their original grouping.

Features are `lakh-version-features-1`: 74 raw measurements, extended to 148 absolute and within-song min/max-relative measurements (`lakh-version-features-1-relative-1`). Constant relative features are 0.5; duplicates do not alter normalization. Inputs include vocal/lyrics metadata, melodic candidates, note/voice density and diversity, duplicate notes, native-grid timing, meter/tempo changes, programs/banks/velocity/controllers, integrity and 16 GM-family shares. Feature order is preserved in the dataset/model. Filename numbers, annotation contents and directory ordering are excluded from musical inputs. Vocal heuristics and GM metadata are proxies, not verified vocal identification or listening quality.

| Top-1 accuracy, fractional credit for tied files | Validation (31 groups) | Exploratory test (17 groups) |
| --- | ---: | ---: |
| Pairwise linear ranker | 25.8% | 41.2% |
| Selected GBDT | 40.3% | 32.4% |
| Most voices | 30.4% | 36.3% |
| Most notes | 37.4% | 29.4% |
| Uniform random | 37.2% | 28.3% |
| Base filename, diagnostic only | 71.0% | 61.8% |

The strong base-filename diagnostic exposes selection/catalog provenance bias; it is not a musical feature. The selected GBDT's validation/test top-2 is 77.4%/70.6%, MRR 0.647/0.588. These small samples and weak gains do not establish accurate corpus-wide recommendations; the deployed order is explicitly preliminary. Test results were inspected before changing model families, and all groups have now informed visual feature design: the test is **exploratory**. A new untouched, explicitly reviewed holdout is required for a future claim of generalization.

**Linear:** `lakh-version-linear-28fc6d88a9eb`, pairwise logistic loss, train-only standardization clipped at ±6, prescribed weight signs, 1,800 full-batch steps at `0.1/(1+epoch/600)`. Validation selected L2=0.03 from `[.003,.01,.03,.1,.3,1]`, ordered by top-1 then MRR. It failed promotion against musical baselines. The original local artifact promotion and subsequent withdrawal are both retained.

**GBDT:** `lakh-version-gbdt-165c23d46053`, scikit-learn `HistGradientBoostingClassifier` pointwise binary preference scorer, ranked within each song. Each group supplies positive weight 1 and total comparison weight 1, then weights normalize to mean 1. Six candidates: `(trees, depth, minLeaf)` = `(20,2,10), (40,2,10), (80,2,10), (40,3,10), (80,3,10), (80,2,20)`. Learning rate .08, L2=2, max leaves 7, bins 64, seed 41, no early stopping. Validation selected **80 trees, depth 3, minimum leaf 10** by top-1 then MRR, preferring smaller trees on ties. Both absolute and relative features have prescribed monotonic signs for counts, vocal proxies, grid and integrity. The visual counterexamples motivate removing or conditioning these assumptions in future ablations. JSON inference matches native probabilities within `1e-10`. Ranking logits are not calibrated confidence that the user will prefer a file.

Runtime: Node 24.12.0, midi-file 1.2.4; Python 3.14.7, NumPy 2.5.3, scikit-learn 1.9.1 in `/private/tmp/rawl-phrase-training`. MIDI features preserve `(port,channel)` identity and the program at onset; physical FIFO note-offs, no sustain. Unclosed notes extend to file end. Format-0 track titles are not interpreted as vocal labels; SMPTE, format 2, invalid timing and insufficient pitched content are rejected. CC120/123 note termination is not simulated. Rawl's score renderer can use different overlapping-note/unclosed-note rules, so long plotted notes need playback/render validation.

## Training history and reproducibility

All records appear in the [append-only training register](model-training.md). The five version-ranking records preserve these events:

| Run directory under `reports/model-training/` | Event |
| --- | --- |
| `2026-10-07T07-11-11-122Z-versionRanking-447edaeea38b-79547c` | Initial linear local artifact promotion. |
| `2026-10-07T07-15-01-830Z-versionRanking-447edaeea38b-cf1d59` | Failed baseline gate; linear withdrawn. |
| `2026-10-07T07-15-51-959Z-versionRanking-7605e9f9e0d3-83a2e2` | GBDT report serialization failed on NumPy bool after fitting/export; only selected weights survived this attempt. |
| `2026-10-07T07-15-58-115Z-versionRanking-7605e9f9e0d3-17f939` | Fixed serialization, deterministic rerun; all six candidate weights archived, selected local artifact saved. |
| `2026-10-07T07-25-47-554Z-versionRanking-7605e9f9e0d3-01543a` | Deployment withheld pending visual review; successful fit retained as a candidate, no refit. |

Archives include source/feature arrays, annotations/catalog/input hashes, configuration, evaluations and available candidate weights. Current reports are convenience views. Do not rewrite old records when correcting features or labels.

```sh
node scripts/rawl/prepare-lakh-version-training.cjs
node scripts/rawl/train-lakh-version-ranker.cjs
/private/tmp/rawl-phrase-training/bin/python scripts/rawl/train-lakh-version-model.py
node scripts/rawl/index-lakh-version-rankings.cjs
# Deploy existing scores after verifying current MIDI bytes; no model fit.
node scripts/rawl/index-lakh-version-rankings.cjs --deploy
node --test scripts/rawl/lakh-versions.test.cjs
npx tsc --noEmit
```

Training commands without `--promote` retain candidates rather than replacing the selected artifact. Optional `--annotations PATH` and `--preferences PATH` select label inputs; explicit preferences map canonical group ID to an exact corpus key, e.g. `{"ABBA/moneymoneymoney":"c/MIDI/ABBA/Money Money Money.mid"}`. Preparation overwrites the current dataset report, so preserve/hash an existing split before introducing new labels or aliases. Indexing defaults to `reports/lakh-version-model/experimental-rankings.json.gz`. Catalog and feature schema are checked; source MIDI byte changes must also be audited/re-extracted before deployment, since indexing consumes cached features.

To reproduce figures and derived diagnostics (human observations remain independently authored):

```sh
node scripts/rawl/export-lakh-version-review.cjs
python3 -m pip install --target /private/tmp/rawl-version-visual-tools -r scripts/rawl/version-review-requirements.txt
PYTHONPATH=/private/tmp/rawl-version-visual-tools MPLCONFIGDIR=/private/tmp/rawl-version-matplotlib python3 scripts/rawl/render-lakh-version-review.py
python3 scripts/rawl/compare-lakh-version-events.py
PYTHONPATH=/private/tmp/rawl-version-visual-tools python3 scripts/rawl/diagnose-lakh-version-grid.py
node scripts/rawl/build-lakh-version-review.cjs
```

The figure environment pins Matplotlib 3.10.7, Pillow 12.0.0 and NumPy 2.5.3. Gallery assembly refuses changed case identities or annotated selections. It never converts hypotheses to gold labels.

## Next controlled experiment

1. Preserve the current evidence and establish explicit winner/acceptable-tie/review-complete labels. Repair title identities and inspect near-copies; reserve a fresh holdout before fitting revised features.
2. Align versions to musical phrases and estimate tactus/downbeats, with existing grid anchors as correction references rather than quality labels. Separate global phase from local drift and required editing effort.
3. Extract principal melody coverage, role separation, independent arrangement detail and coverage of characteristic accompaniment/sections. Compare these features against count-only and current-model baselines on the same split.
4. Evaluate timbre in the role and synth context, with listening labels. Preserve cases where a simple piano reduction was preferred; do not impose an unconditional instrument-count reward.
5. Retrain and archive ablations before upgrading the preliminary suggestions or claiming improved preference accuracy. Current models refit from labels; they do not learn online from gallery browsing or these written hypotheses.
