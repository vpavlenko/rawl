CURRENT OUTPUT — 970 notes: 510 bass/accompaniment, 289 arpeggio, 171 melody.
Final LH closing rule: bass and chord attack at beat1 of18/36/54/72/90/108 and sustain across both closing bars. No LH attack anywhere in19/37/55/73/91/109. Final pair is an octave lower. Latest listening correction supersedes prior m73 retrigger and dyad-only normalization.
Playback releases cover visual spans; repeated pitches elsewhere cap both spans at their next actual attack. Pedal is preserved except for the documented m35–37 closing lift delay. Melody legato crosses barlines; ordinary accompaniment stops at barlines.
Latest SHA256:83c4ed1f9a2fcebf6d48f288d72331af83b81898df62e07c3e46ded8f8938670
Latest revision:no-last-bar-retrigger-updated.json. Read-only check:node reports/idea15-transkun-2026-10-05/validate-sounding-spans.cjs
Mutation scripts below are historical and hash-guarded; do not replay them as a batch.

Reusable proofreading guide: ../../docs/midi-proofreading.md
This guide consolidates the latest decisions and explains how to reuse the verification process.

HISTORICAL REVISION — accompaniment patterns and visual legato

The separate MIDI now contains 970 notes. It includes 30 accompaniment additions, seven removals and 13 release extensions; exact changes and hashes are in pattern-corrections.json. The original Idea 15 file remains unchanged. Earlier revision notes below describe historical outputs.

The white C#4 onset at measure 5 beat 2 is removed per user correction. Accompaniment 26–27 follows 8–9; 192 quarter-note dyads across 96 regular measures were checked against the recurring score pattern, including 14, 88, 99 and 107. Missing notes were reconstructed from repeated patterns and the MuseScore-derived reference, with the lower final-section register informed by the recording. These are pattern-based transcription corrections, not a claim that every added attack was independently resolved from audio. The detected retrigger at measure 73 is retained.

Melody display spans reach the next melodic attack across barlines without overlapping it. Accompaniment visual spans bridge the last two measures of each section (18–19, 36–37, 54–55, 72–73, 90–91, 108–109); repeated pitches stop at their next attack, including 73. Other accompaniment spans stop at barlines. These rules change rendering only.

All 90 source controller events remain intact on each of the three piano channels. Pedal was present in 74–91, but some accompaniment note releases preceded the next pedal-down event. Short releases spanning that pedal transition are now extended to just after pedal-down so they sustain in playback. Melody and arpeggio playback notes are unchanged by this revision.

validate-patterns.cjs checks note corrections, 192 dyads, the retrigger at 73, unchanged melody playback, exact controller preservation, nonoverlapping cross-bar melody spans, and all six accompaniment endings. TypeScript passed. Chrome verified rendering and playback/seek on the existing localhost server; its console reported no warnings or errors. The remaining raw arpeggio gap at measure 98 is not filled by this accompaniment revision.

HISTORICAL REVISION NOTES

Idea 15 — separate Transkun version, 2026-10-05

File: idea-15-transkun-visual-legato.mid
Rawl route: /f/idea-15---gibran-alcocer-transkun

All 947 Transkun notes preserve their pitches, velocities, onset ticks and release ticks. The source tempo and total playback duration are unchanged. Notes are split by register into three piano voices for independent inspection. The existing Idea 15 MIDI and annotations have not been replaced.

The MIDI contains RAWL_DISPLAY text metadata with a 109-measure grid aligned to detected recording attacks, the original structural layout defaults, and visual legato enabled. Rawl reads this metadata and extends only the rendered rectangles. The original note spans still drive playback, note audition, timing edits and playback highlights. Files without this metadata follow the existing rendering path. Ordinary MIDI players ignore the display hints.

Measure alignment uses the earlier score/audio comparison to locate corresponding bass/melody attacks. Two outlying anchors were corrected to nearby detected attacks between their neighboring downbeats. These display-only anchors can be reviewed in display.json. Visual legato bridges successive attack groups within each voice, preserves distant rests and leaves drum notes unchanged.

Validation: prepare.cjs asserts equality of all 947 pitch/onset/release/velocity tuples against the original transcription. validate.cjs compares actual Rawl parsing before/after and checks visual extension, the 109-measure grid, legacy MIDI behavior, malformed hints and drum notes. TypeScript check passed. Chrome confirmed the three voices, legato rectangles, 109 measures, playback/seek through the final section and completion at 1:51; the Transkun page console contained no errors. saved.json records the verified hash of both the separate file and unchanged original.

Pedal / texture revision

The original Transkun export contains 88 sustain-pedal events (CC64) and two soft-pedal events (CC67). The initial voice split omitted controllers; this revision restores all 90 events at their exact source ticks on each piano channel. The 947 note tuples remain identical to the source. Preparation asserts equality of every controller sequence on all three channels.

Visual attacks now align to six equal slots per 3/4 measure, matching the repeating eighth-note grid in the existing MuseScore-derived MIDI. Voice assignment follows the piece's sections, rather than a fixed register threshold that split accompaniment dyads and low arpeggio tones across voices. Visual spans stop at the next attack group and the current barline, even when the detected note release or pedal sustains past either. Audio note timing, releases and controller timing are unchanged.

Verified all 48 arpeggio measures (20–35, 56–71, 92–107): 47 contain all six attack slots. The sole remaining gap is slot 4 (zero-based) of bar 98, where the raw transcription has an Eb3 accompaniment attack but no Eb4 arpeggio attack. This revision preserves the source notes. Details: texture-patterns.json. Display rules are independently tested on an overlapping sustained melody and at every barline.

Sound-request revision

Explicit CC67=127 (soft pedal on) and CC91=36 (modest reverb send) now occur at tick zero on every piano channel. The source already had CC67=127 at 0.098 seconds and CC67=0 near the end; those events remain. The new start event covers the very first notes. All 970 note tuples, source controllers and display metadata are unchanged. sound-updated.json records publication hashes.

Analysis of the official recording's final decay is in ambience-evidence.json. The mid signal falls from about -31 dBFS at 109 s to -59 dBFS at 111.5 s; stereo side energy becomes comparable late in the tail. This demonstrates a multi-second combined decay, but does not separate piano resonance, pedal, reverb and possible production fade. CC91=36 is an initial artistic approximation, not an inferred wet percentage or measured room RT60. Standard CC67 is an on/off request, not a felt-depth control.

Rawl initializes its global synth reverb to zero. The matching tinyplayer source explicitly disables reverb at that setting, so embedding CC91 alone does not enable audible reverb in Rawl. A player with reverb enabled can honor the request. Soft-pedal response likewise depends on the instrument. No global player settings or soundfont were changed in this revision.

Free felt SF2 found: Tom Guder's FuchsUndMoehrV10.sf2, described by its creator as public domain, three-layer stereo upright samples, slightly out of tune. Creator/download page: https://www.polyphone.io/en/forum/your-creations/850-acoustic-felt-piano-upright-fuchs-mohr ; SF2 link: https://drive.google.com/file/d/1NCaVdQQyK4YbbA9ztrkBQYN8jpvbcQDG/view . This is a candidate, not auditioned or installed. Softify Piano Vol 1 is another free option in SFZ, which Rawl cannot load directly: https://www.pianobook.co.uk/packs/softify-piano-vol-1/ .

Measure 80 pedal correction: B3 released at exactly the pedal-down tick, before CC64 in event order. Extended only that release by 19 ticks (9.9 ms) so pedal catches it. E3 already extended past pedal-down. All other events, including pedal timing and CC67/91, remain unchanged.

Measures 5 / 78–79 correction: restored original C#4 onset/release/velocity at m5 beat2 (ticks8216–8357, velocity38). Removed three extra C#5 melody-layer detections at m78 beats2/3 and m79 beat1. Preserved m78 beat1 C#3/C#4 bass octave, source controllers, m80 pedal catch and display hints. Current note count968.

Measures80–81: four G#4 accompaniment notes were classified as melody, causing m80beat3 to stop visually at the following half-beat melody attack. Moved these note pairs from channel2 to channel0; pitches, velocities, raw onsets/releases and all controllers unchanged. Accompaniment spans now reach the beat/bar boundary.

Sounding-span revision: removed extra F#4 at m35 beat2 from the arpeggio voice. All remaining detected attacks and velocities are preserved. Playback releases now cover every visual span. Visual spans and old releases stop at the next detected attack of the same pitch, avoiding a delayed old note-off cutting a retrigger short. New display metadata flag capAtRepeatedAttack enables the visual clipping; other MIDIs retain their existing behavior. All controllers are preserved, and no volume/expression/all-sound-off events were introduced. Current967 notes; exact changes are in sounding-spans-updated.json.

Closing pedal35–37: moved channel0 CC64=0 from tick72736 (37.8833s) to73176 (38.1125s, m38 start) to avoid an early cutoff of lingering LH notes. At the boundary, closing note-offs occur first, then pedal-up, then new attacks; next pedal-down remains at73448. Every note event and other controller event is unchanged.

Measure36: restored missing F#3 bass retrigger at beat1, tick69290 (36.0885s), velocity33; held through36–37 to tick73176 (m38 start). Supported by corresponding endings and an11.5dB increase in the recording175–195Hz band near36.1s. All prior notes and controllers unchanged. Current968 notes.

Uniform ending revision: Uniform editorial normalization: first closing bar beat1 bass plus B/D# dyad; second closing bar beat1 dyad only; bass held across both. Final ending octave lower. Existing attacks/velocities retained; inserted attacks use melody anchor and velocity39. Recording confirms bass entry consistently; dyad attacks less conclusive, confirmed73 retained. Controllers and other voices unchanged. Added15 attacks; removed m73 beat3 F#3. Current982 notes. See uniform-endings-updated.json and ending-attack-evidence.json.

Latest correction: User listening correction supersedes prior m73 retrigger and dyad-only normalization: no left-hand attack anywhere in last bars19/37/55/73/91/109. Hold bass and dyad from first closing bar across both; final ending octave lower. Pedal and other voices unchanged. Removed12 LH attacks and extended preceding dyads across their full closing pair. Current970 notes. See no-last-bar-retrigger-updated.json.
