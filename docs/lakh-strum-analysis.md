# Chord-filling voice detection (default on; `strum=0` to opt out)

Analyzed 100 randomly selected, readable local Lakh MIDIs from 17,266 files. Sampling is without replacement using a seeded shuffle (`20260925`). One malformed file, `Nirvana/Smells Like Teen Spirit.8.mid`, was recorded and skipped. Of the 100 analyzed files, 97 have at least three nonempty MIDI channels; the other three bypass voice analysis. Channels match the app's voice model, rather than MIDI tracks.

Reproduce with `node scripts/rawl/analyze-lakh-strum.cjs`. The complete sample, per-channel measurements, skipped file, and detection timings are in `lakh-strum-sample.json`. The script uses `midi-file` to read note intervals and tempo changes: the stricter `midifile` reader rejected a missing end-of-track marker in the initial sample. It preserves the historical whole-file detector for reproducing the original sample; the frontend now uses the measure-local rule below, sharing the same occupancy measurement. Program numbers in the report are zero-based, informational, and never classification inputs.

## Rule

For each voice and each measure, clip overlapping notes to the measure boundaries, then sweep note starts/ends in time order, counting distinct sounding MIDI pitches. Integrate sounding time, time with at least three pitches, and pitch-count × elapsed time. Classify that voice in that measure when all hold:

- Three or more pitches overlap for at least 50% of the voice's sounding time within that measure.
- Average polyphony while sounding within the measure is at least 2.5.
- Three-or-more-pitch overlap covers at least 15% of the measure duration. There is no whole-piece coverage requirement.

This measures visual filling directly. It accepts slightly staggered strums and sustained pads without requiring simultaneous attacks or a particular timbre. Time weighting prevents a fast monophonic arpeggio from being treated as thick accompaniment. Counting distinct pitches avoids duplicate unison notes inflating the result. The coverage requirement excludes short chord accents; the average-polyphony requirement filters borderline mixtures of triads and single notes. Drums do not qualify, but count toward the file's three-voice eligibility.

## Historical whole-file sample findings

Under the previous whole-file rule, 164 of 772 pitched voices qualified, across 86 files. These counts and timings describe that historical rule, not the current measure-local classifier. Median detector execution was 0.59 ms per eligible file; the cold-run maximum was 6.39 ms in local Node execution. These are detector-only measurements, not browser performance guarantees.

| File / channel (zero-based) | Chord fraction | Average polyphony | Piece coverage | Result |
| --- | ---: | ---: | ---: | --- |
| Nirvana / Rape Me, channel 0 | 71.6% | 2.52 | 22.7% | Thin guitar chord part |
| Nirvana / Rape Me, channel 1 | 98.9% | 2.99 | 58.6% | Thin guitar chord part |
| Babyface / Everytime I Close My Eyes, channel 11 (pad program 91) | 91.5% | 4.41 | 35.2% | Thin pad |
| Collins Phil / In The Air Tonight.3, channel 2 (pad program 89) | 66.5% | 3.97 | 64.2% | Thin pad |
| Genesis / Follow You Follow Me.2, channel 4 | 100% | 3.00 | 8.4% | Keep brief chord accents full height |
| Genesis / Follow You Follow Me.2, channel 5 | 0% | 1.48 | 0% | Keep sparse guitar full height |

Sensitivity: a 50% chord-fraction threshold selects 164 voices; 60% selects 146 and 70% selects 120 (other thresholds unchanged). The original 60% threshold missed the Piano voice in `The Beatles/I Saw Her Standing There.mid`. It has 54.3% chord time, average polyphony 2.86, and 43.3% piece coverage. Lowering the threshold to 50% recognizes this alternating chordal accompaniment while retaining the polyphony and coverage safeguards. Only its Piano voice qualifies; its five other pitched voices remain full height.

Reanalyzing the original 100-file sample adds 18 voices in total. All additions have average polyphony at least 2.55 and chord coverage at least 26.9%, supporting that they occupy substantial score space. This is exploratory measurement, not manually labeled precision/recall validation.

## Frontend behavior and limits

Enabled by default. Append `?strum=0` (or `&strum=0`) to the score URL to opt out. Classification runs only when enabled and with at least three nonempty voices, and is memoized across playback frames and hover/zoom changes. Notes are assigned to overlapping measures using binary search, then endpoints are sorted within each voice/measure. With M measures and K note/measure overlaps, cost is O(N log M + K log K) at worst and O(K) temporary storage; there is no audio analysis or server request. Excluded voices and voices reassigned to drums follow the current arrangement.

Qualifying notes have half their previous height at rest, during playback, and during hover, including bent-note ribbons and collapsed marks. They always render below other voices (z-index 5, above the analysis grid at 1–4), including during hover and playback. The existing bottom/pitch anchor and pitch spacing remain fixed. Playback enlargement still applies, at half its previous height.

A voice with dense melody-plus-chords also qualifies: the target is visual density, not musical role. Two-note power chords and non-overlapping arpeggios do not qualify. Chordal verses qualify independently of sparse or silent choruses. Sparse measures retain normal height, even when the same voice is chordal elsewhere. A held note crossing measure boundaries remains one rendered shape and is thinned if any overlapping measure qualifies. Classification uses committed measure boundaries, including manual timing edits; without valid measure boundaries it leaves notes unchanged. Sustain pedal/reverb tails are intentionally ignored because the rendered note intervals, rather than acoustic sustain, determine score filling. No minimum attack count is imposed, so a few very long pad chords can qualify.

App builds, tests, and browser verification are left to the user per AGENTS.md.
