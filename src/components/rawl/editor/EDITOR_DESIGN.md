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

There are two main commands for note manipulation:

## Diatonic insert.

Syntax: `coordinate sequenceOfNotes`.

`coordinate` specifies measure and beat number, a syntax is `measureNumber`(b`beatNumber`). If the beat number is omitted, it defaults to 1. The beat number can be fractional, .5 always means the second eight regarding the specified swing (so, a semantic .5 will mean a midi's .66 for 66% swing - when translating to ticks).

## Diatonic copy.

Syntax: `coordinate c measureSpanFrom sequenceOfShifts`.
