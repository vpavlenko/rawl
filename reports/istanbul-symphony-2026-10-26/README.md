# Istanbul Symphony transcription and review

Source: user-provided İstanbul Senfonisi.pdf, Schott full score, Fazıl Say, op. 28 (2008–2009). PDF SHA-256: `41b9a6292cd7b10b49793262cf6b72bc7208709d2c662ba06309a086c48bef0c`.

The score states that it is notated at sounding pitch. No extra wind transposition was applied. PDF pages 17–48, 49–67, 68–79, 80–89, 90–108, 109–126 and 127–143 form the seven movements. The last three pages are blank.

This is vector-glyph transcription with systematic source checks and focused visual/audio review, not a publisher MIDI or a manual certification of every note. Reproducible scripts and source provenance remain in `~/repos/ftm/istanbul`.

47,402 source heads, 1,111 paired tremolo signs, 175 tuplets including nested groups, 108 measure repeats and 72 octave lines were decoded. All numbered measure ranges are continuous. Internal dashed subdivisions remain inside the same numbered measure. Repeated orchestral unisons are collapsed on output. These counts describe operations rather than an accuracy estimate.

## Review corrections

- Recovered graphical ties and carried accidentals: all 497 reviewed pitch targets pass. This includes I/92, I/102–104 and analogous passages; I/188–189 Viola is G-flat. The printed Horn A/G-sharp dissonance remains.
- User-confirmed erratum I/29: second-violin D5 at quarter offset2.25 is D-sharp5 in both unison divisi staves. The PDF omits the sharp; parallel voices and motif repetitions support the correction.
- IV/30 Clarinet2's four cyan G-sharp4 notes match the PDF and are retained.
- Ordinary dynamics persist across systems; sf/fz affect their local attack only. Pizzicato/arco and percussion changes follow source labels and positions, including divided string staves. Combined accent, marcato, staccato, portato and tenuto glyphs are decoded. Source phrase slurs connect notes while explicit short articulations keep their gates.
- IV/1–8 strings are pizzicato; flute is mf scherzando. IV/45's foreground instrument is Marimba. These states also apply to the source reprises. I/150's moving oboe/brass line retains ff and tenuto/slurs while sf marcato stabs are shortened. V/61–72 quiet woodwind ostinatos retain ppp.
- I/208–209 contains Kudüm, not Timpani. The Timpani bass-clef pitches E-flat3/A2 at189 and A2 at190 are correct, then Timpani is silent. Kudüm uses a drum-bank approximation outside III; III's explicitly tuned B/D remains melodic.
- All GM drum-bank instruments share one `Percussion` track on port0/channel9, preserving source note velocities. CC11=100 matches the melodic baseline; CC7=70 versus melodic86 calibrates the packaged GM bank. Focused actual-SF2 measurements place IV/45 percussion within approximately2dB of Marimba, and V/61 percussion near the leading string part. This is sample-bank calibration rather than a change of score dynamics.
- Pitched tremolo uses held notes. Strings use GM44 Tremolo Strings; measured A/B chords occupy independent channels with opposite CC11 envelopes. There are no rapid note retriggers in pitched tremolo. Actual percussion rolls retain physical strikes. Both packaged Rawl SoundFonts respond audibly to CC11 without new attacks; port isolation and seeking pass.
- IV/105 contains a tenuto quarter in Tuba, with a fermata over the opening dotted-quarter rest. Local performance tempi widen that rest and the quarter without changing the written rhythm.

## Timing and approximations

Reference: Frankfurt Radio Symphony / Howard Griffiths, 10 November 2012, https://www.youtube.com/watch?v=8ZtMVdnnm_Q . Downloaded with yt-dlp. Whitened STFT chroma, multi-bar alignment and focused spectra support review; static harmonies, noise and free glissandi have low alignment confidence.

Tempi are based on printed source anchors and reference musical passages, never total chapter duration. Printed quarter135 at I/69 and quarter56 at VI/126 remain. The unsupported slowdown after I/189 and VII/99/111 changes are removed. Approximately167 seconds of unnotated Kanun improvisation before VI's notated Allegro are excluded rather than stretching its first24 bars. Rubato and numeric realizations of fermatas/ritardandi remain approximate; all choices and confidence are in `tempo-all-movements.json`.

Ney uses flute, Kanun uses dulcimer, Turkish percussion uses GM approximations, and waves use Seashore. Continuous noise gestures, microtonal inflection, free glissandi and orchestral timbre are approximations on a semitone MIDI grid. A held percussive GM instrument can decay during a long tremolo; the continuous rendering does not supply a dedicated sampled roll articulation. Artificial fourth-touch harmonics sound two octaves over the lower ordinary head. Natural harmonics retain written pitch.

## Verification

Every MIDI is reopened for paired events, nonnegative deltas, no same-pitch overlap or hanging notes, synchronized track endings and SHA-256 consistency. All seven run through the actual Rawl transform, parser, sequencer and packaged WASM synthesis harness. A separate review check asserts all497 pitch targets, the user erratum, retained correct cyan notes, continuous pitched tremolo and exactly one GM drum voice in the real parser for every movement. Local production-code execution and browser/public readback are recorded separately.

| Movement | Measures | MIDI attacks | Approx. seconds |
| --- | ---: | ---: | ---: |
| 1 | 219 | 10539 | 589.5 |
| 2 | 126 | 8838 | 222.7 |
| 3 | 34 | 5773 | 419.2 |
| 4 | 105 | 4051 | 233.8 |
| 5 | 122 | 6362 | 242.8 |
| 6 | 136 | 7714 | 244.8 |
| 7 | 116 | 2033 | 366.3 |

Focused soundfont renders cover IV/1–8, IV/45–49, I/150–152 and V/61–72. They are diagnostic measurements, not uninterrupted listening of every movement. No exhaustive human note-by-note review is claimed.

Final publication: GitHub Pages commit `fb0376cba9c4bc138f357261825bcf9834746a89`, successful deployment40312283158. All7 Firebase blobs and local copies verified; all7 versioned public MIDI downloads returned HTTP200 with matching SHA-256. Chrome loaded all7 revised movements with one Percussion control and no console errors; IV playback progressed0:08–0:24, then paused. Evidence: public-validation.json, installed-validation.json, browser-expression-validation.json and continuous-tremolo-live.png.

User flute-balance follow-up: IV/1–8 and17–24 Flute CC11 multiplier1.26 (~+4dB in actual Rawl SF2); IV/17–24 first/second string desks multiplier.60 (~-8.8dB). Notes, velocities, articulation, programs and timing unchanged; six other files byte-identical. See flute-balance/REPORT.md and comparison.json for reference spectrogram, controlled before/after stems, and event parity.

Kanun follow-up: main-note inventory VI/35–39 is complete; four-note grace figures previously shared one onset. The16 heads at36/37/41/47 now form sequential C4-D4-E-flat4-F-sharp4 pickups, with fixed main onsets. Only grace note-on/off events changed in VI; other six files remain byte-identical to the flute-balance revision. Grace spacing is a performance realization (.0625quarter per head); GM15 still has a naturally short decay.

Instrument-control follow-up: the seven Istanbul slugs display one legend row per original instrument name. Mute/solo/hover and editing actions fan out to the original member indices. MIDI channels, parser arrays and note IDs remain independent. Production synthesis worker and CSS are byte-identical; grouped UI source passes focused callback/mask tests and a full frontend release compilation. Differential TypeScript has17 prior diagnostics and no added diagnostics. Browser/public validation is recorded separately.

Final grouped-control verification: successful GitHub Pages run40327087127, commit290f290253e2ed885b7fb5a178a39ad96a6ba4d8. Chrome verified all7 unique-instrument row counts (22,21,21,18,19,20,24), one ViolinI/II row each, no console errors, and IVsolo preserving all four ViolinI display members1/6/22/23 before restoring all18 controls. Actual App callback tests prove grouped hover routes all underlying channels and restores the stored mute mask. All published MIDI, main/vendor bundles and identical synthesis worker pass HTTP200/SHA-256 readback.
