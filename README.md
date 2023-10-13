# Chiptheory

This is a fork of [Chip Player JS](https://github.com/mmontag/chip-player-js) that focuses on music theory analysis of NES tracks.
All credits for tremendous original work go to Matt Montag and all contributors to libraries that he managed to wire together. I'm just writing a tiny layer on top. The licensing is the same.

My stuff lives primarily in [src/components/chiptheory](src/components/chiptheory), I also removed some features from the UI to maximize useful display area for analysis.

My analyses in JSON are available [here](corpus/analyses.json)

# Hypothesis

Languages on NES are clusters that are far away from each other. Some games that are unbound by external influences try to make tracks for levels so that all levels are as far from each other as possible. To achieve that, they employ the following languages:
- [common practice](https://vpavlenko.github.io/chiptheory/search/style/common_practice) ([periods](https://vpavlenko.github.io/chiptheory/search/form/period), [V/V](https://vpavlenko.github.io/chiptheory/search/chords/V/V) and [other](https://vpavlenko.github.io/chiptheory/search/chords/V/vi) applied dominants)
- [jazz](https://vpavlenko.github.io/chiptheory/browse/Nintendo/A%20Ressha%20de%20Ikou?subtune=3) (this one is rare)
- [12-bar blues](https://vpavlenko.github.io/chiptheory/search/form/12-bar_blues) or [blues scale]() (I-IV or stasis)
- chiptune ([constant structures](https://vpavlenko.github.io/chiptheory/search/harmony/constant_structures), modulations with exact repetitions, [mixolydian shuttles](https://vpavlenko.github.io/chiptheory/search/harmony/mixolydian_shuttle), [Super Mario cadence](https://vpavlenko.github.io/chiptheory/search/chords/VI-VII-I) or [phrygian](https://vpavlenko.github.io/chiptheory/search/scale/phrygian) stasis, [parallel keys](https://vpavlenko.github.io/chiptheory/search/harmony/parallel_keys), [quartal](https://vpavlenko.github.io/chiptheory/search/harmony/quartal))
- [hijaz](https://vpavlenko.github.io/chiptheory/search/scale/hijaz)
- [chromatic](https://vpavlenko.github.io/chiptheory/search/scale/chromatic)
- [atonal](https://vpavlenko.github.io/chiptheory/search/scale/atonal)
- [pentatonic](https://vpavlenko.github.io/chiptheory/search/scale/pentatonic), including [W-arpeggios](https://vpavlenko.github.io/chiptheory/search/voice_leading/W-arpeggio) - specifically when depicting China or Japan
