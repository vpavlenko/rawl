# Chiptheory

This is a fork of [Chip Player JS](https://github.com/mmontag/chip-player-js) that focuses on music theory analysis of NES tracks.
All credits for tremendous original work go to Matt Montag and all contributors to libraries that he managed to wire together. I'm just writing a tiny layer on top. The licensing is the same.

My stuff lives primarily in [src/components/chiptheory](src/components/chiptheory), I also removed some features from the UI to maximize useful display area for analysis. Annotations live in [src/corpus/analyses.json](src/corpus/analyses.json)

Your own annotations currently won't be saved, but I can fix that - please, contact me.

# Hypotheses

Languages on NES are clusters that are far away from each other. Some games that are unbound by external influences try to make tracks for levels so that all levels are as far from each other as possible. To achieve that, they employ the following languages:

- [common practice](https://vpavlenko.github.io/chiptheory/search/style/common_practice) ([periods](https://vpavlenko.github.io/chiptheory/search/form/period), [V/V](https://vpavlenko.github.io/chiptheory/search/chords/V/V) and [other](https://vpavlenko.github.io/chiptheory/search/chords/V/vi) applied dominants)
- [jazz](https://vpavlenko.github.io/chiptheory/browse/Nintendo/A%20Ressha%20de%20Ikou?subtune=3) (this one is rare)
- [12-bar blues](https://vpavlenko.github.io/chiptheory/search/form/12-bar_blues) or [blues scale]() (I-IV or stasis)
- chiptune ([constant structures](https://vpavlenko.github.io/chiptheory/search/harmony/constant_structures), modulations with exact repetitions, [mixolydian shuttles](https://vpavlenko.github.io/chiptheory/search/harmony/mixolydian_shuttle), [Super Mario cadence](https://vpavlenko.github.io/chiptheory/search/chords/VI-VII-I) or [phrygian](https://vpavlenko.github.io/chiptheory/search/scale/phrygian) stasis, [parallel keys](https://vpavlenko.github.io/chiptheory/search/harmony/parallel_keys), [quartal](https://vpavlenko.github.io/chiptheory/search/harmony/quartal))
- [hijaz](https://vpavlenko.github.io/chiptheory/search/scale/hijaz) - surprisingly, without any Near East connotations
- [chromatic](https://vpavlenko.github.io/chiptheory/search/scale/chromatic)
- [atonal](https://vpavlenko.github.io/chiptheory/search/scale/atonal)
- [pentatonic](https://vpavlenko.github.io/chiptheory/search/scale/pentatonic), including [W-arpeggios](https://vpavlenko.github.io/chiptheory/search/voice_leading/W-arpeggio) - specifically when depicting China or Japan

Two things are interesting:

- these languages most likely don't blend within a single track, but may well go together in different levels of the same game
- other world language are absent: hemitonic pentatonics, gamelan, maqamat. all tunings are 12-edo

Another hypothesis is that Chinese developers largely used Chinese traditional pentatonic-based tonic-ambiguos language with guzheng imitations, disregarding the game content. (Or did they describe it in their own language, which I as a Westerner don't understand?)
