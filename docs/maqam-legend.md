# Arabic corpus reference

The `scaleLegend: "maqam"` corpus setting replaces the Western chord stairs,
keyboard, and scale groups for pieces in the Abraham Salman, Ibrahim Al Aryan,
and Riyad Al Sunbati corpora. Other corpora retain their existing legend.

The compact legend shows all nine root ajnas in Rawl notation, using the
same root spans as the jins-1 brackets on `/maqam`, extending Kurd, Hijaz and
Bayati through their stable fifth and prepending practical lower auxiliaries.
The source brackets on `/maqam` retain their original spans. The legend has
5 px padding. Its order matches the page: ajam, rast, hijaz, kurd,
nikriz, nahawand, bayati, saba, sikah (the root jins of huzzam). Note lengths and tonic
columns align, and each name's baseline lies on its tonic line. Clicking the
name, notes, or empty space in a row toggles its practice playback. Its Lucide
play/stop icon appears on row hover or during playback. The standard piano-legend
fold control sits above the panel; there is no separate corner Stop button.
The same Rawl playback clock, quartertone markers, tooltip and Shift-hover
tonic recoloring apply. Its Maqamat link, followed by a Lucide square-arrow-out-up-right icon,
opens `/maqam`, which renders one Rawl scale per maqam, with the lower
auxiliaries prepended to its full scale. All nine rows fit the first desktop screen in two columns at widths of
1280 px and above; narrower screens use a single column. There are no separate jins blocks or sayr diagrams on that screen.
The original book crops remain source evidence, without being rendered in the legend.

Source: Johnny Farraj and Sami Abu Shumays, _Inside Arabic Music: Arabic Maqam
Performance and Theory in the 20th Century_ (Oxford University Press, 2019).
The source figures are cropped directly from the user's PDF. The archived crops
use white/black inversion for the app background. The reference page uses
the source pitch sequences in tonic-relative Rawl colors and semitone spacing.
The archived source figures retain small auxiliaries, open noteheads and
accidentals. The Rawl examples retain the pitch order and jins brackets, with
equal-width notes throughout. Visible note bars fill the complete column, ending exactly at the next
note's start; the last note has the same width. Jins brackets use those same
column edges. A shared column grid reserves space for the
largest set of lower auxiliaries, so the tonic and following scale degrees
align across all nine staves. Source sayr crops remain as source evidence but
are not rendered. No complete book pages are bundled.

The title, source attribution and corpus link occupy a left sidebar. Each
maqam name is right-aligned left of its stave, centered on the gray fifth guide,
with a right-aligned Lucide play/stop icon underneath. The name anchor comes
from the same pitch-coordinate layout as the production guide.
Figure numbers and page references remain in source data and this document,
without appearing under the maqam names.
All displayed maqam and jins names use lowercase, including accessible labels.

The reference order is Ajam, Rast, Hijaz, Kurd, Nikriz, Nahawand, Bayati, Saba, Huzzam.
Nikriz uses the source C tonic and lower B-flat/B auxiliaries. Figure 24.45
is printed descending; its scale is normalized to the ascending reference order.
Its root jins spans C–D–E-flat–F-sharp–G, followed by Nahawand on G.
Hijaz includes the Hijazkar branch from figure 24.35 (printed 395), with
Nikriz on degree 4 and Hijazkar on degree 8. The book's C-based figure is
transposed to Hijaz's existing D tonic for comparison; this transposition is
traditionally named Shahnaz. Its source scale and sayr crops are archived as
`hijazkar-*`. The primary Nahawand and Rast branches remain unchanged.
Practice plays the primary Hijaz scale, its Rast branch, then the complete
Hijazkar branch through the source's upper extension.
Huzzam's second ascending shoulder is Sikah, from figure 24.23.
Its available content height is observed on resize. A common pitch height is
maximized across the taller column of staves, reserving the inter-stave gaps, bracket
labels and the production renderer's upward playback expansion.
Root-jins brackets sit above their notes, and the other brackets sit below
their own notes, inside the open areas of each scale. Overlapping lower
brackets are stacked where needed. This avoids reserving an empty label band
under every stave.
The upper brackets for jins 1 sit two semitones lower than the original
playback-headroom placement, following the normal note-top contour.

The displayed root brackets include degree 5 for Ajam, Rast and Nahawand;
degree 4 for Hijaz, Kurd and Bayati; and degree 3 for Huzzam's Sikah jins. Saba retains its
source five-note span. These display extensions leave the original source
bracket indices in `maqamScales.ts` intact.

Huzzam's practical lower notes are C and D. The additional E-flat in the book's
extended Sikah figure is an optional raised leading-tone approach, described in
table 14.10 (printed 224); it is omitted from the practical reference and default
exercises. The full source array and the archived book figure remain
intact. `practicalLower` records that explicit subset instead of changing the
source transcription.

`MaqamRawlNotation` calls the production `TonalGrid` from `AnalysisGrid.tsx`
and `getNoteRectangles` directly. The grid accepts a standalone numeric tonic,
including Huzzam's fractional tonic, and the note renderer accepts optional
accessibility attributes. Both score and reference use `noteCoordinates.ts`
for the existing pitch-to-Y formula. Only tonic and fifth guides are drawn;
the bottom edge of each corresponding note rests on its guide, including
while hovered or playing.

Playback uses the production `useNotePlaybackClock`, `NotePlaybackContext`,
and `PlaybackSectionContext`. Each stave has a separate timeline section and
each note occurrence has its own timed span; its drawing position uses the
existing `displaySpan` API. Repeated attacks of one drawing register multiple
intervals with an aggregated callback. The qanun scheduler exposes its Web Audio clock
position, which advances Rawl's note clock on animation frames. Repeated
pitches therefore highlight only the current occurrence on the current stave.
Individual-note audition registers only that drawing's attack. Stop, replacement
and unmount clear the shared clock and animation frame. The compact legend
uses the same occurrence-specific registration for its root-jins notes.

The page practice buttons use five rounds; compact legend ajnas use only the
first four. Both use 220 ms between
attacks and an 800 ms pause between blocks. The user approved these turns:

1. 1–2–3–2–1
2. 1 down through every displayed lower auxiliary to the lowest note, then back to 1.
3. 1–lower 7–1–2–3–2–1
4. 1–2–3–4–5–4–3–2–1
5. 1–2–3–4–5–6–7–8, then 8–7–6–5–4–3–2–1 on the displayed descending shoulder.

Saba's first round reaches its characteristic degree 4. Its second round goes
down to the lowest auxiliary and back to 1, then up to degree 4 and back to 1.
Saba has an extra final round through every displayed upper extension, up to
the last note and back to the tonic, without repeating the peak note. Its third
round also reaches degree 4; its fourth already includes that degree. The compact root-jins exercise stays
within its shorter displayed range.

When a shoulder descends, the final descent uses its alternate notes (Ajam,
Nahawand and Rast). When the second shoulder ascends, round 5 first ascends and
descends on the primary scale, then repeats a full ascent/descent on that
alternate scale. This applies to Hijaz, Bayati and Huzzam/Sikah. Saba uses its
printed first eight degrees. Round 3 uses the scale's seventh an octave lower;
round 2 includes every lower auxiliary shown in the practical reference.
Each duration is 220 ms, meeting the next attack exactly in legato. Highlighting
clears only between rounds, while Stop stays available through pauses and the
final ringing decay.

Hover uses the existing Arabic corpus `NoteCentsTooltip` and its shared
tonic-relative cents calculation. Compact formatting shows values such as
`1.5`; the corpus keeps its existing two-decimal formatting. Hover does not
set `noteUnderCursor` or enlarge reference notes. Playback enlargement is
still handled by the production note clock.

Shift-hover previews the hovered note as tonic for colors on that stave only.
It calls the existing `getHoverColorPitchClass` helper from `hoverTonic.ts`;
pitch positions, guides, playback and the tooltip's original tonic stay fixed.
Pressing or releasing Shift updates the preview without moving the pointer.
Mouse leave and window blur clear it. There is no separate tonic control.

The shared note renderer marks quartertone intervals with a 2 px white dot on
both this page and song scores. Eligibility uses the currently colored interval
from the active tonic, including hover tonicization, in the inclusive 0.25–0.75
fractional-semitone window. MIDI bends are sampled at the note midpoint. A white
tonic has no dot, including Sikah's fractional absolute tonic. The dot's center
sits 2 px below the note's fixed lower edge, at the former tick's center, and
does not move when playback expands the note upward. Notation reserves space
below its lowest note so the whole dot remains visible. Static bends use the
standard voice-shaped rectangle at their exact sounding height and color;
changing bends retain the ribbon. Collapsed notes and drums have no marker.
The left sidebar explains: "Shift-hover: use this note as tonic."

| Row      | Extended jins | Maqam scale              | Sayr  | Printed pages |
| -------- | ------------- | ------------------------ | ----- | ------------- |
| Ajam     | 14.7          | 24.57 (Egyptian version) | 24.58 | 213, 405      |
| Hijaz    | 14.12         | 24.33                    | 24.34 | 217, 393–394  |
| Nikriz   | 14.5          | 24.45                    | 24.46 | 211, 399–400  |
| Nahawand | 14.3          | 24.39                    | 24.40 | 209, 397      |
| Kurd     | 14.14         | 24.51                    | 24.52 | 219, 402      |
| Rast     | 14.1          | 24.1                     | 24.2  | 207, 379      |
| Bayati   | 14.10         | 24.15                    | 24.16 | 215, 385–386  |
| Saba     | 14.16         | 24.63                    | 24.64 | 221, 408      |
| Huzzam   | 14.18         | 24.21 + Sikah 24.23      | 24.22 | 223, 388–389  |

Reproduce all crops with `python3 scripts/rawl/extract-maqam-figures.py /path/to/book.pdf`.
`public/maqam-figures/figures.json` records the source hash, page numbers, crop
coordinates, rendering scale, and output hashes.

The figures use the standard tonic printed in the book (C for
Ajam, Nikriz, Nahawand, and Rast; D for Hijaz, Kurd, Bayati, and Saba; E half-flat for
Huzzam). Qanun playback now uses the same register as the printed figures.
Half-semitone values represent
symbolic quarter tones, rather than measured performance intonation. The root
jins figures include their upper auxiliaries as well as their lower auxiliaries.
Practice playback traverses the displayed pitches in the approved blocks,
including the alternate descending ajnas.

Qanun previews use 18 actual CC0 isolated-note recordings by Barış Bozkurt,
sliced by the joetessy/qanun project and pinned to a specific source revision.
The F3–D-sharp6 bank covers every book note within one nominal semitone of a
recorded source. Each attack plays one recorded pluck. Sustain stays on: every
sample runs through its cleaned natural decay, overlapping subsequent notes and
block pauses, with a short fade only at the recording's end. Its 220 ms attack
window does not choke its audio tail. Stop, replacement and folding cut all
ringing sources. There is no tremolo or repeated synthetic attack.
Sample sources, the verbatim upstream notice, revision, and per-file hashes are
recorded under `public/audio/qanun/`.
Playback uses gently denoised 24-bit FLAC derivatives; the original M4A files
remain intact. FFmpeg FFT denoising is limited to 6 dB, with a -65 dB noise
floor and smoothed gain. Its measured delay is compensated to preserve attack
timing. A 15 ms end fade avoids abrupt endings. B3's noisy final 130 ms are
excluded, with a 50 ms fade before the 1.55 s clean endpoint. Full processing
commands, source/output hashes and the signal audit are recorded alongside
the bank and under `reports/maqam-reference-2026-11-09/`.
The source labels are nominal pitches: an audit of the recordings found
fundamental offsets of about -35 to +27 cents across the complete bank.
No per-sample tuning correction is applied. Quarter-tone shifts therefore
preserve the intended playback ratio rather than guaranteeing concert tuning.

The earlier three-note oud bank and artificial tremolo were removed after user
feedback; their pitch shifting and repeated attacks were not convincing. The
user explicitly selected sampled qanun and dropped the tremolo requirement.
The same cleaned recordings now supply Arabic MIDI playback and note auditions.
`usesQanunTimbre` selects every corpus configured with the maqam legend,
including Arabic traditional, Abraham Salman, Ibrahim Al Aryan and Riyad Al
Sunbati. The timbre choice crosses the UI/worker boundary before playback starts.
A generated SoundFont packages the same 18 clean samples for the existing
MIDI sequencer, preserving bends, velocities, seeking, mute and per-port state.
All melodic programs use qanun; source bank/program messages cannot switch
them away. GM percussion is retained, and later non-Arabic files restore GM.
`RAWL_TIMBRE:qanun` is supported for portable MIDI. A corpus's qanun choice
takes precedence over an older oud tag. Original recordings remain recordings.

Score clicks and Shift-hover auditions use sampled qanun, including bent
pitch. Source instrument labels and saved voice names remain intact.
The Edit score workflow is unchanged.

`qanunLevels.json` calibrates each sample to a common 0.85 peak. Preview gain
is 0.75; MIDI output receives a further 2x gain for the sparse Arabic mix,
with soft limiting only above a 0.95 peak to contain unusually loud overlaps.
This raises quiet recordings without compressing their attacks. Full preview
practice overlaps are checked against clipping. The cleaned FLAC files remain
unchanged; level calibration is applied by the sampler and SoundFont builder.
Rebuild the bank with `python3 scripts/rawl/build-qanun-soundfont.py`;
`public/audio/qanun/soundfont.json` records source hashes, key ranges, levels
and the content-addressed output name.

The previews use an independent Web Audio graph. Selecting
another preview cancels the previous one. Stop, folding, navigation, and unmount
cancel scheduled sources and UI timers, including a pending sample download.

The reference page is a visual reference for these nine maqamat; it does not
reproduce the book's prose or claim to cover the complete maqam system.
