# MIDI proofreading using Idea 15 as a blueprint

This guide describes how we compared Gibran Alcocer’s Idea 15 recording, a MuseScore-derived transcription, and a Transkun transcription, then checked the result in Rawl. Use the same process for other Ideas: establish the form, compare repeated passages, resolve individual attacks and registers against the recording, inspect pedal event ordering, and verify playback separately from visual legato.

## Central rule: the score must have a coherent grammar

Similar musical places should be transcribed the same way. Treat repeated sections as multiple observations of the same musical pattern: their pitches, registers, attack positions, voice assignments, and sustain behavior should follow a coherent rule.

When corresponding places differ slightly, reopen the evidence and vote across the repetitions:

1. Align the passages by musical role, section offset, and beat, accounting for intentional register or texture changes.
2. List the competing readings, including note present versus absent and retrigger versus continued sustain.
3. Recheck transcription confidence where available, pitch and harmonic energies, and attack envelopes in the recording at every corresponding location. Use comparable windows and account for differences in dynamics; energy alone does not establish a new attack.
4. Vote using the strength of those observations. Give clear, high-confidence evidence more weight than weak detections or omissions; repeated output from the same transcription is not independent confirmation. If confidence scores are unavailable, say so rather than inventing them.
5. Apply the best-supported common reading throughout the corresponding passages. Keep an exception when the recording clearly supports a real variation; if the evidence remains ambiguous, record the chosen coherent reading as an editorial decision and preserve the alternatives for review.

The aim is a consistent musical grammar, with local exceptions justified by evidence. Keep recording-confirmed changes, user listening judgments, pattern-based reconstructions, and display-only adjustments distinguishable in the change log.

## Establish sources and a recoverable baseline

Save the recording URL, score URL or imported score identifier, raw transcription, current MIDI, and saved analysis. Preserve a copy of every version before changing it. Record SHA-256 hashes, note counts by voice, tempo events, end time, and controller events with absolute ticks.

For Idea 15, the recording was [Gibran Alcocer’s video](https://www.youtube.com/watch?v=hyUct2htiNk). The raw Transkun source is [idea-15.mid](../reports/gibran-alcocer-harmony-audit-2026-10-04/transkun/idea-15.mid). The reviewed separate output is [idea-15-transkun-visual-legato.mid](../reports/idea15-transkun-2026-10-05/idea-15-transkun-visual-legato.mid), with its revision records in the same directory. The existing MuseScore-derived version supplied a useful comparison for accompaniment patterns; its transcription is not an authority over the recording.

Create a separate output when trying another transcription. Our Transkun version uses `/f/idea-15---gibran-alcocer-transkun`; subsequent changes preserved the existing `/f/idea-15---gibran-alcocer` file at its baseline for this phase. Earlier work on that existing version is documented separately in [the overdub report](../reports/idea15-overdub-2026-10-05/README.md).

Before editing, establish whether the request concerns sounding notes, notation, voice assignment, or all three. We initially preserved Transkun playback and applied legato only to the display. The user later authorized playback corrections as well. Do not assume that permission to lengthen rectangles also permits changing note releases.

## Align the measures to the recording

Locate corresponding bass or melody attacks at section boundaries, then check intermediate anchors. Convert MIDI delta times to absolute ticks before comparing events; use the tempo map to convert ticks to seconds. A transcription’s time-signature metadata can be wrong even when its note timing is useful.

Idea 15’s Transkun export has PPQ 960, tempo 500,000 microseconds per quarter note, and raw 4/4 metadata. The reviewed display uses a recording-aligned grid of 109 measures, three beats per measure, and six subdivisions per measure. The grid is stored in [display.json](../reports/idea15-transkun-2026-10-05/display.json) and embedded as `RAWL_DISPLAY` text metadata. This display grid does not quantize playback or change the MIDI time-signature event.

Write locations as “m.5 beat 2” rather than “measure 5 bar 2.” Include the recording time and absolute tick for a disputed onset when possible. Confirm that everyone is discussing the same version and measure grid.

## Map the form before fixing local exceptions

Idea 15 gave us six corresponding sections:

| Section starts | Regular material | Closing measures |
| --- | --- | --- |
| 2, 20, 38, 56, 74, 92 | 16 measures each | 18–19, 36–37, 54–55, 72–73, 90–91, 108–109 |

Build a comparison by section offset and beat. Review horizontally, asking whether a bass figure or arpeggio continues its rhythmic pattern. Review vertically, asking whether each attack contains the expected chord tones and whether another voice already supplies a shared pitch.

We checked 192 accompaniment dyads at beats 2 and 3 across 96 regular measures. Measures 26–27 were compared with 8–9; the same review covered exceptions such as 14, 88, 99, and 107. The final section required lower registers in some corresponding figures, so exact pitch copying from an earlier section would have been wrong.

Use symmetry both to find discrepancies and to resolve ambiguous readings through the confidence-and-energy vote above. Apply the resulting rule consistently while accounting for intentional register changes, endings, overdubs, and genuine performance variations. Some accompaniment additions in our first pass were reconstructed from repeated patterns and the score reference; they were not all independently resolved as new attacks in the audio.

## Resolve attacks and register against the recording

Loop a short passage with enough lead-in to hear the preceding harmony and enough follow-through to hear the release. Compare full playback with accompaniment or melody isolated in Rawl. Voice soloing helps identify the transcription’s contents, but the recording remains the evidence for what was performed.

Check these questions separately:

1. Is the pitch present, and in which octave?
2. Is there a new attack, or is an earlier note still ringing under pedal?
3. Is an apparent octave a real second note, a harmonic, or a transcription artifact?
4. Does the tone belong to the melody, accompaniment, or arpeggio?

Spectral analysis can support pitch and register judgments. Compare short windows around the attack and during the following sustain, using harmonic templates when useful. A strong harmonic does not establish an independent note; pitch energy alone does not establish a fresh attack. Envelope changes and repeated passages provide additional evidence, but neither should silently override a clear listening correction.

Concrete Idea 15 outcomes:

| Passage | Final decision | Lesson |
| --- | --- | --- |
| 92–109 | Earlier accompaniment continues beneath the melody; the arrangement needs independently inspectable layers. | A studio recording can contain more simultaneous material than two hands can perform. |
| 96–99 and corresponding final figures | Compare bass and accompaniment registers against earlier sections and the recording. | Check absolute octave, not just note color or pitch class. |
| 108–109 | Low F♯2 persists across the ending; the earlier closing red-note interpretation was rejected. | Review the whole ending rather than isolated rectangles. |
| 36 beat 1 | Restore the F♯3 bass retrigger and hold it through 36–37. | Compare corresponding endings and check the bass-frequency attack in the recording. |
| 19, 37, 55, 73, 91, 109 | No LH retrigger anywhere in the last bar; sustain bass and chord from the preceding closing bar. | The latest listening correction supersedes the earlier m.73 retrigger judgment and the subsequent dyad-only normalization. |
| 78–79 | Remove three extra C♯5 notes from the melody layer; retain the accompaniment. | Distinguish a lower melody doubling from a bass octave. |
| 5 beat 2 | Restore the original white C♯4 accompaniment note, including its detected timing and velocity. | Our earlier removal was reversed after further user review; the latest decision supersedes the old log. |

## Audit pedal and note releases together

Inventory CC64 sustain, CC67 soft pedal, and other controllers before splitting voices. When notes move to separate MIDI channels, those channels need the relevant pedal sequence too. Our initial split lost controllers; we restored all 90 source controller events, including 88 sustain events and two soft-pedal events, at their original ticks on each of the three channels.

For an apparently dry attack, list the preceding pedal-up event, note-on, note-off, and following pedal-down event. Inspect both timestamps and event order. Pedal-down cannot catch a note that has already been released. Repedaling shortly after an attack can be legitimate; fixing a missed catch does not necessarily require moving the pedal.

At m.80 beat 1, B3 began at tick 153837. Its note-off and pedal-down both occurred at tick 153964, but note-off appeared first. We extended that release to tick 153983, about 10 ms after pedal-down. E3 already lasted past the pedal transition. The pedal timestamps remained unchanged.

The broader 74–91 complaint also led to short release extensions where notes ended between pedal-up and the following pedal-down. These were playback corrections, not visual changes. Check equality at the pedal boundary as well as releases strictly before it; our first pass missed the equal-tick case at m.80.

The later 35–37 review found an early left-hand pedal lift at 37.8833 seconds, about 229 ms before m.38. The final change delays only channel 0 CC64=0 to the m.38 boundary at 38.1125 seconds. Closing note-offs precede pedal-up, which precedes the new attacks. The next pedal-down and every note event remain unchanged. This is a playback smoothing decision following user review, not a claim that the original recording had a different pedal timestamp. Record this exception when comparing source controller sequences.

## Check voice assignment before changing a short visual span

A short rectangle can be caused by the next attack in the wrong voice, even when the audio note and pedal are correct. Trace the rectangle through the parsed voice, raw `span`, and optional `displaySpan` before lengthening a MIDI note.

At m.80 beat 3, gray G♯4 was incorrectly assigned to the melody. The next melody attack, halfway through the beat, shortened its visual span. Moving the four G♯4 accompaniment notes in 80–81 to the accompaniment voice made the dyads uniform. Their pitches, velocities, onset times, and release times were unchanged.

Use musical role and section context for voice assignment. A single register threshold can separate a chord’s notes or mistake a high accompaniment tone for melody.

## Apply visual legato independently of playback

The final Idea 15 display rules are:

- Melody spans reach the next melodic attack across barlines and do not overlap that next attack, even when the sound continues under pedal.
- Ordinary accompaniment spans reach the next accompaniment attack or the current barline.
- Closing accompaniment spans can bridge the last two measures of each section. There are no LH attacks in the final bar; the bass and chord sustain from the first closing bar. Any repeated pitch elsewhere stops at its next attack.
- Arpeggio attacks align visually to the six-slot grid; visual snapping does not change detected playback timing.

Rawl implements these hints in [midiDisplay.ts](../src/components/rawl/midiDisplay.ts), reads them in [parseMidi.ts](../src/components/rawl/parseMidi.ts), and renders them through [getNoteRectangles.tsx](../src/components/rawl/getNoteRectangles.tsx). Ordinary MIDI players ignore the text hints. Raw spans still drive playback and note audition.

After changing a voice, recompute its visual groups and inspect neighboring notes. A voice reassignment can fix a span without changing the legato algorithm.

## Make playback cover the displayed span

The user subsequently requested that every note remain held for at least its displayed span. This supersedes the earlier policy of keeping short Transkun releases. Detected attacks and velocities remain intact. Note releases are extended to cover the visual ends; where a repeated pitch attacks sooner, both the old release and its visual span stop at that actual attack. Equal-tick note-offs precede new note-ons so the old release cannot cut the retrigger short. Pedal and sound controllers are retained except for an explicit closing-pedal correction described below; no channel-volume, expression, or all-sound-off events are added to shorten notes. A held piano note can still decay naturally in the synthesizer.

This policy requires checking every parsed note after rewriting the MIDI: raw release must be at or after visual end, and no previous same-pitch release may occur after the next detected attack. Preserve onset ticks and attack velocities explicitly. The extra F♯4 at m.35 beat 2 was removed as a separate pitch correction.

## Verify and publish each revision

Compare the intended change against the immediately preceding version. For a voice reassignment, pitch, velocity, onset, and release tuples should remain identical when channel is excluded. For a release correction, allow only the listed note-off changes. For additions or removals, record the exact tuples and their evidence. Independently compare controllers, tempo events, display metadata, note counts, and end time.

Use a guarded update: check the current live blob’s hash before replacing it, change only the separate output, read it back, and verify its hash against the local artifact. Check that the baseline version remains unchanged. Keep before/after hashes and recoverable backups in the report directory.

Then use the user’s existing `http://localhost:3000` server in Chrome. Do not start a server or run `npm run build-lite`. Reload the published version, inspect both affected and corresponding reference measures, play through the passage with lead-in, and check seeking, melody/accompaniment controls, and the ending where relevant. Read fresh console output for compile errors and runtime regressions. Record pre-existing warnings separately from new failures.

The final uniform-ending rule uses the same LH pattern at 18–19, 36–37, 54–55, 72–73, 90–91, and 108–109: first bar beat 1 attacks F♯3, B3, and D♯4; all three sustain across both bars, with no LH retrigger anywhere in the second bar. The final pair uses F♯2, B2, and D♯3. The isolated F♯3 attack at m.73 beat 3 is also absent. Existing first-bar detected attacks retain their timing and velocity; reconstructed first-bar chord tones follow that bar's melody onset with velocity 39. Note releases cover the full closing spans, and pedal controllers remain unchanged.

The user's latest listening correction explicitly supersedes the earlier m.73 retrigger judgment and the editorial choice to repeat the dyad in every last bar. Twelve last-bar LH attacks were removed and their preceding chord notes extended. See `no-last-bar-retrigger-updated.json`; `uniform-endings-updated.json` is historical. This is why a coherent transcription rule must remain revisable when listening evidence changes. The first-bar reconstructed chord attacks remain editorial decisions where the audio is inconclusive.

The current Transkun artifact has 970 notes across three voices: 510 bass/accompaniment, 289 arpeggio, and 171 melody/overdub notes. Its SHA-256 is `83c4ed1f9a2fcebf6d48f288d72331af83b81898df62e07c3e46ded8f8938670`. These are the snapshot values on 2026-10-05; recompute them after another edit.

The report’s scripts and README contain historical revisions. `prepare.cjs` recreates an earlier output, publication scripts write to Firebase, and older validation scripts assert superseded counts or decisions. Read them before reuse; do not treat an old passing test as validation of the latest file or blindly rerun the mutation scripts. The duration policy and m.35 note correction are in `sounding-spans-updated.json`; the subsequent closing-pedal change is in `m35-ending-pedal-updated.json`, and the missing bass retrigger is recorded in `m36-bass-updated.json`. Earlier local corrections are in `m5-m78-updated.json`, `m80-gray-updated.json`, and `m80-pedal-updated.json`.

## Keep unresolved questions visible

The earlier arpeggio audit found all six slots in 47 of 48 arpeggio measures. The missing E♭4 arpeggio attack at m.98 slot 4, counting from zero, was not filled by the accompaniment corrections. Keep this as an unresolved transcription gap rather than describing the entire piece as perfectly symmetric.

Sound design is a separate review. The MIDI requests CC67=127 at the start and CC91=36 on each voice, in addition to the source controller sequence. The reverb send is an artistic starting estimate, not a measured wet percentage. Audio decay combines piano strings, pedal resonance, reverb, and possibly a production fade. Rawl’s reverb engine remains disabled, and the felt-font download and UI work were aborted at the user’s request; no felt font was installed or auditioned.

## Record the next Idea in this format

For each disputed passage, record:

| Field | What to write |
| --- | --- |
| Location | Measure, beat, recording time, MIDI tick, and version |
| Observation | What sounds or looks wrong |
| Comparisons | Corresponding measures and source differences |
| Evidence | Recording listening, user judgment, spectral support, or pattern inference |
| Decision | Pitch, attack, release, voice assignment, pedal, or display-only change |
| Exact change | Before/after note or controller tuples |
| Preservation checks | Unchanged events, timing, metadata, and baseline hashes |
| Chrome verification | Passage inspected/played and fresh console findings |
| Open questions | Remaining ambiguity or uncorrected gaps |

Finish each pass with a current decision list and an explicit unresolved list. Retain the revision history for recovery, but make the latest interpretation easy to find so a reversed decision such as m.5 beat 2 is not accidentally reintroduced.
