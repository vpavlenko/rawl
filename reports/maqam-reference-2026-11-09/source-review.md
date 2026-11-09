# Maqam pitch source review

Reviewed the 16 chapter 14/24 staff crops in `public/maqam-figures/` against
`src/components/rawl/legends/maqamScales.ts` on 2026-11-09. Source: Johnny Farraj
and Sami Abu Shumays, *Inside Arabic Music* (2019), figures and printed pages
listed in the data. The chapter 14 introductory notation key and Saba/Sikah
characteristics were also checked in the local PDF text.

No pitch corrections were required. All lower auxiliary, extended jins, and full
maqam sequences match the cropped source notation, including repeated or altered
notes after the first ascent. The full maqam arrays are figure sequences, rather
than sorted unique pitch collections.

| Maqam | Lower auxiliaries | Extended jins | Full maqam |
| --- | --- | --- | --- |
| Ajam | A3 B3 | C4 D4 E4 F4 G4 A4 | C4 D4 E4 F4 G4 A4 B4 C5 Bb4 A4 G4 |
| Hijaz | B-half-flat3 C4 | D4 Eb4 F#4 G4 A4 Bb4 | D4 Eb4 F#4 G4 A4 Bb4 C5 D5 G4 A4 B-half-flat4 C5 D5 |
| Nahawand | Ab3 A3 B3 | C4 D4 Eb4 F4 G4 Ab4 | C4 D4 Eb4 F4 G4 Ab4 B4 C5 Bb4 Ab4 G4 |
| Kurd | C4 | D4 Eb4 F4 G4 A4 Bb4 | D4 Eb4 F4 G4 A4 Bb4 C5 D5 |
| Rast | A3 B-half-flat3 | C4 D4 E-half-flat4 F4 G4 Ab4 A4 | C4 D4 E-half-flat4 F4 G4 A4 B-half-flat4 C5 Bb4 A4 G4 |
| Bayati | B-half-flat3 C4 | D4 E-half-flat4 F4 G4 A4 Bb4 | D4 E-half-flat4 F4 G4 A4 Bb4 C5 D5 G4 A4 B-half-flat4 C5 D5 |
| Saba | B-half-flat3 C4 | D4 E-half-flat4 F4 Gb4 A4 Bb4 | D4 E-half-flat4 F4 Gb4 A4 Bb4 C5 Db5 D5 E5 F5 |
| Sikah | C4 D4 D#4 | E-half-flat4 F4 G4 Ab4 | E-half-flat4 F4 G4 A4 B-half-flat4 C5 D5 E-half-flat5 |

`coreLength` now records how many notes starting at the tonic have normal-size
noteheads in chapter 14; remaining upper notes and all lower notes are small
auxiliaries. Counts are 5, 4, 5, 4, 5, 4, 6, 3 in display order. This encodes the
figure's note sizes, rather than asserting that Saba belongs to a six-note class.
Table 14.1 places Saba among four-note ajnas while explicitly noting the difficulty
of classification.

`ghammaz` records the normal-size open notes. The values relative to each tonic
are 7, 5, 7, 5, 7, 5, [3, 8], and 3.5. Saba retains both F and Bb: table 14.9
distinguishes degree 3 as melodic emphasis from degree 6 as the modulation point,
and explains that either may be argued to be its ghammaz. The data deliberately
preserves both open noteheads from figure 14.16.

`scaleGroups` transcribes the chapter 24 bracket labels and their spans in the
displayed sequence. These are visual partitions rather than complete independent
jins membership lists: a shared endpoint may begin the next bracket, as G does
between Rast 1 and Upper Rast 5/8. Saba retains both rows of overlapping brackets,
including Hijaz 3 and Nikriz 6 below Saba 1 and ‘Ajam 6. The group labels are
transcribed source text, not newly written explanatory interface copy.

Quarter-tone values encode the book's symbolic notation as half-semitone offsets.
They do not encode measured performance intonation. This matters particularly
for Saba's low fourth and for Sikah's context-dependent tonic and leading tone.
Sample playback at these offsets can demonstrate the symbolic pitch sequence,
but does not reproduce all intonation described in the book.
