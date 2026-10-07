# Harmonic analysis and search across Lakh

Rawl now has a reproducible MIDI harmony pipeline, a corpus search at `/discover/harmony`, and a chord ribbon over the existing MIDI score. It separates absolute chord recognition from interpretation against a local tonic. The first release supports consecutive Roman-numeral searches such as `IV bVII I`, preserves uncertainty, and produces modulation, phrase and section proposals without replacing curated annotations.

The optimization target should be **precision of retrieved passages**, with recall measured on independently annotated positive passages. An accurate global key or a high frame-level chord score alone does not establish that a requested progression actually occurs. The current implementation is an inspectable baseline; the available annotations do not yet support a credible corpus-wide chord-search accuracy claim.

## Methods and research

| Method                                 | Evidence and implications for Rawl                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pitch-class templates and key profiles | These make a fast, interpretable baseline. Duration, register and accompaniment weighting matter because a MIDI file mixes harmonic support with melody and ornaments. A major/minor profile cannot by itself distinguish tonicization, a modal passage, or an established modulation.                                                                                                                                                                                                   |
| Joint chord segmentation and labeling  | [Masada and Bunescu, 2019](https://arxiv.org/html/1810.10002) use a segmental conditional random field and features including chord coverage, duration/accent-weighted segment purity, bass and figuration. The relevant design choice is to evaluate complete spans, so broken chords can accumulate support and ornaments need not become separate harmonies. Rawl uses a segmental dynamic program with hand-weighted features; it does not implement or reproduce their trained CRF. |
| Learned harmonic context               | [Chen and Su, Harmony Transformer, 2019](https://archives.ismir.net/ismir2019/paper/000030.pdf) explicitly links segmentation and harmonic recognition. This supports a later learned model that jointly predicts boundaries and chord functions. Its published results concern different datasets; they do not transfer directly to Lakh arrangements.                                                                                                                                  |
| Structural novelty                     | [Foote-style novelty segmentation, illustrated by the FMP notebooks](https://www.audiolabs-erlangen.de/resources/MIR/FMP/C4/C4S4_NoveltySegmentation.html), compares musical material before and after a candidate boundary. Rawl currently compares chroma and voice activity over neighboring measures. This is a cheap local novelty approximation, not the full checkerboard self-similarity algorithm. Repetition-based section labeling remains future work.                       |
| External aligned labels                | The [McGill Billboard project](<https://ddmal.ca/research/The_McGill_Billboard_Project_(Chord_Analysis_Dataset)/>) supplies chord, timing, structure and tonic annotations. Those times describe recordings, so they require alignment to a MIDI arrangement before becoming timing ground truth. They are a useful expansion source beyond the current short chart excerpts.                                                                                                            |

The main MIDI obstacles are missing chord thirds, inversions, arpeggiation, sustained notes across changes, melody notes mistaken for chord tones, unreliable meter or pickups, mixed drum and pitched channels, duplicate arrangements, and inaccurate source files. Note pitches also omit enharmonic spelling and harmonic intent. A secondary dominant can look like a new key, and a repeated modal loop can favor several tonic hypotheses. A section can change through texture while retaining the same chords; phrases may continue through a cadence or end without one.

## Annotated references and alignment

The seed corpus contains three short excerpts with source provenance in `scripts/rawl/harmony-references.json`:

| Song and passage                   | Guitar-chart excerpt                                                                            | Hooktheory context                                                                                                                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hey Jude outro                     | F–E♭–B♭–F from [E-Chords](https://www.e-chords.com/chords/the-beatles/hey-jude)                 | [TheoryTab](https://www.hooktheory.com/theorytab/view/the-beatles/hey-jude) distinguishes F major verse material from the F Mixolydian outro.                                                              |
| Let It Be verse opening            | C–G–Am–F from [E-Chords](https://www.e-chords.com/chords/the-beatles/let-it-be)                 | [TheoryTab](https://www.hooktheory.com/theorytab/view/the-beatles/let-it-be) identifies C major and separates song sections.                                                                               |
| Sweet Child O Mine intro and verse | D–C–G–D shapes from [E-Chords](https://www.e-chords.com/chords/guns-n-roses/sweet-child-o-mine) | [TheoryTab](https://www.hooktheory.com/theorytab/view/guns-n-roses/sweet-child-o-mine) supplies section context. The chart specifies E-flat tuning, so sounding pitch is a semitone lower than the shapes. |

These are **weak excerpt labels**, not complete transcriptions. Only the chord symbols and essential provenance are stored; lyrics and full charts are not copied. The title/artist join groups arrangement versions, then local edit alignment tests all twelve transpositions, collapses repeated chord families, and permits arrangement insertions. An exact short sequence remains a candidate for human review because it may recur in another section. Partial alignment never becomes a verified annotation.

`import-harmony-chart.cjs` accepts a permitted ChordPro excerpt, source URL, artist, title, section, tonic and optional semitone offset. It extracts supported bracketed chord symbols and discards lyrics. Capo, tuning and concert-pitch offsets must be supplied explicitly; they cannot safely be inferred from chord shapes.

The [official Hooktheory API](https://www.hooktheory.com/api/trends/docs) provides next-chord probabilities and songs containing a progression. It requires a bearer token, limits request rate, and does not provide a full TheoryTab research dump. `fetch-hooktheory-progressions.cjs` implements the documented progression-presence endpoint and pagination. Its results can seed title/section review queues; they contain no chord timings and cannot be used as timestamp labels. The adapter is included but authenticated API retrieval has not been exercised in this run.

## Implemented pipeline

1. Read PPQ MIDI timing, tempo and meter changes, sustain events, MIDI ports and channel identity. Reject SMPTE timing and invalid or excessively large grids. Record malformed or unsupported files rather than silently losing them. Close dangling note events at the file end and record that repair.
2. Respect saved excluded voices and drum overrides. Where an annotation supplies manual measures, use Rawl's existing measure reconstruction. These timing and arrangement references are shared by evaluation and indexing.
3. Build half-beat observations. Downweight high monophonic voices, cap octave duplication within a voice, and retain separate bass evidence. Search variable spans of one, two, four and eight observations using chord-template purity, coverage, bass support and a segment penalty. Keep unknown spans and missing-third power chords explicit.
4. Estimate local major/minor keys over neighboring measures and smooth changes with a transition penalty. A rotation-equivariant tonic ranker learns note, bass, chord-root and ending features from annotated training titles. A separate calibration subset selects its blend with key-profile scores and the tonic score temperature. Chord evidence remains heuristic, and the combined retrieval score is not a calibrated probability.
5. Interpret chord roots against the local tonic. Saved tonics may guide indexed Roman numerals; independent inferred keys remain available for evaluation. The notation uses chromatic intervals relative to the tonic, including `♭III`, `♭VI` and `♭VII`, so modal and borrowed-chord searches do not depend on a major-only vocabulary.
6. Infer phrase candidates from a learned length prior plus cadence, rest and novelty evidence. Suggest sections at sustained chroma or voice-activity changes. Export boundaries in Rawl's cumulative `phrasePatch`, `sections`, `modulations` and `modulationOnset` formats. Low-confidence tonic regions are omitted from the proposal.
7. Encode consecutive harmonies for retrieval. Silence, unknown harmony and tonic changes terminate a match. Family mode collapses adjacent triad/seventh variants; an explicit seventh query remains exact. Missing-third power chords do not satisfy a major/minor query. Duplicate numbered arrangements collapse to the highest-ranked version unless the user enables all arrangements.

The score ribbon shows both Roman numerals and absolute chord names, local key/tonic regions, suggested phrase and section boundaries, and dashed styling for uncertain estimates. Clicking a chord seeks to its onset. Chord spelling follows the displayed Roman degree. Corpus sidecars preserve the same analysis that produced a search hit and include a fingerprint of their annotation settings. Browser-saved changes to tonics, timing or excluded/drum voices invalidate that cached result. Recalculation uses current MIDI notes and annotation settings; it can differ because the player parser does not extend note spans through sustain in the same way as the offline reader. Neither the ribbon nor proposal downloads save annotations automatically.

## Evaluation and optimization

Title groups use a deterministic SHA256 split: one fifth is held out, with all numbered arrangements kept in the same group. Phrase-length statistics exclude held-out titles. The key ranker also reserves a calibration subset within the remaining titles. Test annotations never supply tonic labels to the independent detector. Indexed search labels guided by saved tonics are explicitly marked in the UI and are excluded as evidence of inferred-key accuracy.

The full report is `reports/lakh-harmony/evaluation.json`. Tonic agreement compares pitch class only because Rawl annotations do not label mode. Phrase, section and modulation boundaries use a one-measure tolerance and one-to-one matching. Phrase references include the existing implicit four-measure grid; section and modulation metrics cover files with explicit changes. These incomplete references make boundary scores diagnostic rather than comprehensive estimates of all true boundaries. Alternate versions can contribute multiple test files, so the report also lists the distinct held-out song count.

The next useful gold set should contain exact, timed positive and negative passages for several harmonic queries, including borrowed chords, inversions, missing thirds, short tonicizations and genuine modulations. Review the highest-ranked hits, random middle-ranked hits, and near misses. Optimize passage precision at 10/50, recall within the labeled set, and abstention coverage. Use duration-weighted root/quality agreement and boundary errors to diagnose failures. Reserve song and artist groups before tuning; do not optimize parameters on the held-out result table.

Once that gold set exists, compare this baseline with a trained segmental model or a symbolic Harmony Transformer. Learning chord labels from the three untimed excerpts would not justify such a model. Boundary supervision, chord quality, tonic and retrieval ranking should remain separately measured so an apparent improvement in one does not hide a regression in another.

## Measured results

The October 7, 2026 run attempted 17,266 files and indexed 17,168. The 98 skips retain concrete parser or grid diagnostics in the report. Twenty-two of 26 MIDI arrangements reached a complete or near-complete candidate alignment to the three chart excerpts; those candidates are not accepted timing labels.

| Metric                                    | Result | Scope                                                            |
| ----------------------------------------- | ------ | ---------------------------------------------------------------- |
| Tonic pitch-class agreement               | 65.4%  | Duration-weighted, 68 held-out files from 66 titles              |
| Tonic agreement at evidence at least 0.60 | 74.8%  | Covers 30.6% of labeled test duration                            |
| Phrase boundary F1                        | 0.763  | One-measure tolerance, including implicit phrase-grid references |
| Modulation boundary F1                    | 0.370  | Files with explicit modulation boundaries                        |
| Section boundary F1                       | 0.204  | Files with explicit section boundaries                           |

These results justify a reviewable search prototype, not automatic annotation replacement. Local tonic ambiguity and missed section changes remain material limitations. The next accuracy milestone is a measured precision/recall result for timed progression passages.

## Reproduction

Use the user's existing localhost server. These commands operate offline and do not start a server or build the app:

```sh
node scripts/rawl/index-lakh-harmony.cjs --workers 6
node scripts/rawl/train-harmony-key.cjs
node scripts/rawl/index-lakh-harmony.cjs --workers 6
node --test scripts/rawl/harmony.test.cjs
./node_modules/.bin/tsc --noEmit --pretty false
```

The first indexing pass supplies absolute chord spans for ranker training. Subsequent passes use the checked-in model. The indexer accepts `--references path/to/references.json` to expand excerpt alignment. Public gzip assets contain the search index and per-artist sidecars; their uncompressed JSON sources are ignored by Git. `pack-harmony.cjs` regenerates the compressed assets if required. All curated annotation files remain separate from generated proposals.
