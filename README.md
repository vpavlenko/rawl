# Rawl

This is a fork of [Chip Player JS](https://github.com/mmontag/chip-player-js) that focuses on music theory analysis of MIDI and NES tracks.
All credits for tremendous original work go to Matt Montag and all contributors to libraries that he managed to wire together. I'm just writing a tiny layer on top. The licensing is the same.

My stuff lives primarily in [src/components/rawl](src/components/rawl), I also removed some features from the UI to maximize useful display area for analysis. Annotations live in [src/corpus/analyses.json](src/corpus/analyses.json). 

Your own annotations currently won't be saved, but I can fix that - please, contact me.

## Setup instructions

Try `yarn install` and `yarn start`. If it doesn't work, try reading https://github.com/mmontag/chip-player-js/. Don't compile wasm, I pre-compiled it and added it to the repo.
.

## 12 Colors

https://twitter.com/vitalypavlenko/status/1771820942680830417

## Input formats

### MIDI

MIDI files can be dropped into https://rawl.rocks/ for visualization - to do that, firstly navigate to any MIDI file in the database. Saving for user files isn't supported yet (contact me). Additionally, there's a decent built-in MIDI library coming from Chip Player JS project: [rock/pop](https://vpavlenko.github.io/chiptheory/browse/MIDI/), [classical](https://vpavlenko.github.io/chiptheory/browse/Classical%20MIDI), [jazz](https://vpavlenko.github.io/chiptheory/browse/Jazz%20MIDI)

This content should be transformed so that it's discoverable via search engines on queries like "yellow submarine analysis".

Also, the environment should make it super easy to record a YouTube video with the analysis, and even the one synchronized with real audio instead of a MIDI rendering.

Also, we should probably explore other MIDI datasets, eg. [LA](https://huggingface.co/datasets/projectlosangeles/Los-Angeles-MIDI-Dataset)

Also, this should probably be available on Ultimate Guitar.

### Digital sheet music

There should be a tool to color noteheads of MusicXML and MuseScore files in 12 colors. It should be deployed as a drag-n-drop web app. It should have an instantly playable preview (eg. using https://opensheetmusicdisplay.org/)

We can upload some colored files to MuseScore for the discoverability of our system. I'm not sure how to balance and not to abuse this marketing channel.

Apparently, [some system of coloring](https://youtu.be/Eq3bUFgEcb4?si=HSh0BsRK-fUukSE6&t=4464) will be shipped with MuseScore very soon. We don't know yet how customizable that will be.

### PDF sheet music

There should be an Optical Music Recognition (OMR) pipeline to color noteheads in place. We can probably do that by tweaking https://github.com/BreezeWhite/oemer

### Audio

There should be a tool that colors spectrogram in 12 colors. See [a prototype on Chromatone](https://chromatone.center/practice/pitch/spectrogram/).

Also, there should be a splitter / recongition pipeline. See [transcription notes](https://github.com/vpavlenko/study-music/blob/main/parts/transcription.md)

### Video game music

The early VGM music is in unique position: it allows a precise extraction of a piano roll and it's transmitted in rips which sound almost exactly like composers designed them to.

Early consoles used simple oscillators ([NES](https://vpavlenko.github.io/chiptheory/browse/Nintendo), Sega Game Gear, Sega Master System). Sega Genesis used FM synthesis. It's easy to extract pitches from those. Starting from SNES, I'm not so sure - it may require per-channel pitch recognition or a geeky digging into SNES DSP internals.

### Live performance

Eg. a solo piano performance made from a digital piano should take MIDI notes and visualize them in real-time. Someone should take care of switching a tonic.

## NES

### Hypotheses

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

Another hypothesis is that [Chinese](https://vpavlenko.github.io/chiptheory/search/style/chinese) developers largely used Chinese traditional pentatonic-based tonic-ambiguos language with guzheng imitations, disregarding the game content. (Or did they describe it in their own language, which I as a Westerner don't understand?)

What if every bootleg country has some unique musical language?

Also, it feels like there was a gradual development of cool timbral hacks and compositional form. Games from 1986 are simpler than [games from 1993](https://vpavlenko.github.io/chiptheory/browse/Nintendo/Beauty%20and%20the%20Beast?subtune=1r).

### Composers

Certain composers for NES can have very recognizable style and musical toolchain. [List of sound drivers](https://gdri.smspower.org/wiki/index.php/Famicom/NES_Sound_Driver_List) may also help. This is also a good way to listen to "something similar to that cool track that I've found".

# Levels of tailored education

Let's build education around asking a student to analyze pieces of music.
Then the levels of pieces of increasing attractiveness:

1. Genres that the student doesn't listen to much, in a form that's hard to navigate. Eg. common-practice classical music in sheet music
2. 12-colored piano rolls of random pop pieces available in MIDI. It's for the brave who want to get into the unknown
3. Same for favorite artists for which MIDIs are available.
4. Same but music only is available, so the MIDI is crafted via automatic transcription.

<img width="496" alt="Screenshot 2024-01-25 at 16 07 22" src="https://github.com/vpavlenko/rawl/assets/1491908/9b5e0339-f58b-45ea-99a4-2a919864fa8a">

