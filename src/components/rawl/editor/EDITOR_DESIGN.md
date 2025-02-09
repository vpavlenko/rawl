An editor parses a text-based notation and generates both a midi file and an analysis for it.

A comment symbol is `#`, comments till the end of the line.

A basic unit of time is a beat. There are three levels of grouping above it:

1. Beats are grouped in measures. This is controlled by time signature line. The omitted line defaults to `4/4`. The complete syntax is `numerator/4 (measureNumber numerator/4)*`. /4 is always the denominator, it's not stored/treated, we don't allow /8. The numerator is any positive integer.

Eg. `4/4 5 3/4 9 4/4` means 4 beats per measure in mm. 1-4, 3 beats per measure in mm. 5-8, 4 beats per measure till the end of the piece.

2. Measures are grouped in phrases. There's a four measure default. The change of this default is stored as a `(phrases [measureNumber:±measureDelta])*`, according to @analysis.ts phrasePatch logic. measureDelta is usually 1..3. They are applied consecutively in getPhraseStarts. For debugging purposes, comment the end of the line with `#`.

3. Phrases are grouped in sections. By default, there's a single section 1. Sections are defined as a list of phrase numbers which are their starts. `(sections [phraseNumber])*`.

Phrases and sections are only used for analysis, they don't affect the midi generation.

Measures affect the midi generation. In our generation, each measure has an integer number of beats.

Our syntax is diatonic, so we specify the key signatures (default as `C major`) with a syntax `key (measureNumber:keySignature)*`, where key is `tonic mode`, tonic is `[ABCDEFG][#b]?`, mode is `major` or `minor`. So far a minor defaults to natural minor.

There are two main commands for note manipulation: a diatonic insert and a diatonic copy.

## Diatonic insert.

Syntax: `coordinate sequenceOfNotes`. Eg.:

- `1 1-2-3-4-5-6-7-^1` - a diatonic scale in eights, inserted in measure 1, beat 1 (takes up entire measure 1 in 4/4 or runs over to measure 2 in 3/4).
- `1 135| 613| 461| 572|` - four whole note chords, in 4/4 occupying mm. 1-4. See below for exact definition of whole note.
- `1 1UU| 6UU| 4UU| 5UU|` - an alternative notation for the same thing. (This may also be more efficiently achieved with a diatonic copy.)
- `1 1_UU__ 6_UU__ 4_UU__ 5_UU__` - a broken chord pattern base-chord-chord. (assuming 3/4)

`coordinate` specifies measure and beat number, a syntax is `measureNumber`(b`beatNumber`). If the beat number is omitted, it defaults to 1. The beat number can be fractional, .5 always means the second eight regarding the specified swing (so, a semantic .5 will mean a midi's .66 for 66% swing - when translating to ticks).

`sequenceOfNotes` is `((chord)?(duration) )+`. `chord` is zero, one or several `note`s. A space after each duration is optional.

To interpret the `chord`, we first find `baseNote`: the rightmost note occuring just before the coordinate (lower of those if several).

Then, if a `chord` is empty, it means "repeat the previous chord".

Otherwise, the first note is calculated relative to `baseNote`, and each subsequent note is calculated relative to the previous note of this chord.

A `note` the syntax (`(octaveShift)?((b#)?scaleDegree)|relativeShorthand`)

`octaveShift` is `^+|v+`. Each ^ is +12 midi pitches, each v is -12 midi pitches.

`scaleDegree` is 1..7, relative to the mode. Each `b` is -1, each `#` is +1.

Each `baseNote` has two `scaleDegree`s closest to it: lower and upper. First, we pick the closest one in terms of a diatonic distance. Only after it we apply ±12 and ±1.

`relativeShorthand`'s idea is to help type in melodies going stepwise. `u` is one diatonic step up, `d` is one diatonic step down. `U` is two diatonic steps up, `D` is two diatonic steps down.

`x` is a rest.

`r` is a `root` - unlike a true root, it's simply a lowest note on a first beat of current measure in `lh`. (This behavior may change in the future to accomodate for stepwise bass).

### Duration

`duration` is `(basicDuration)(.)*`. Basic durations are:

- `|` - whole note, is defined as four beats (the time signature doesn't matter).
- `+` - half note, is defined as two beats. (TODO: maybe `o` is better?)
- `_` - quarter note, one beat.
- `-` - eighth note, half a beat in .5 swing. Otherwise the length depends of the position inside the quarter.
- `=` - sixteenth note, straight sixteenths.

## Diatonic copy

Syntax: `coordinate c sourceMeasureSpan sequenceOfShifts`.

Examples:

Assume we have a broken chord in 3/4:

```
3/4
1 1_UU__
```

To turn it into a Pachelbel's progression, we do `2 c 1 -3 -2 -5 -4 -7 -4 -3`. To copy it further to mm. 9-16, we do `2 c 1-8 0`.
