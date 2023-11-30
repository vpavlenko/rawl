# Rawl

This is a fork of [Chip Player JS](https://github.com/mmontag/chip-player-js) that focuses on music theory analysis of MIDI and NES tracks.
All credits for tremendous original work go to Matt Montag and all contributors to libraries that he managed to wire together. I'm just writing a tiny layer on top. The licensing is the same.

My stuff lives primarily in [src/components/chiptheory](src/components/chiptheory), I also removed some features from the UI to maximize useful display area for analysis. Annotations live in [src/corpus/analyses.json](src/corpus/analyses.json)

Your own annotations currently won't be saved, but I can fix that - please, contact me.

## Setup instructions

Try `yarn install` and `yarn start`. If it doesn't work, try reading https://github.com/mmontag/chip-player-js/. Don't compile wasm, I pre-compiled it and added it to the repo.
.

# 12 Colors

<img width="259" alt="Screenshot 2023-11-20 at 21 50 26" src="https://github.com/vpavlenko/12-colors/assets/1491908/685c4c16-861a-4833-8e9c-8dfcba76f0bc">

Harmony of Western music - scales, chords, chord tones, passing notes, suspensions, alterations, borrowed chords, modulations - becomes visible if we color its notes in 12 colors, starting from the tonic. This repo documents the process of converting our world into a 12-colored one.

**Is this a new music notation?** [No.](https://www.youtube.com/watch?v=Eq3bUFgEcb4) It doesn't aim to help people perform music, at all. So, it doesn't cover the vast majority of use cases. Instead, it helps with just the one thing - to rapidly learn and easily navigate through the harmonic language used for composition. That is, to understand structural ideas of composers and to navigate through music theory.

12 colors is an idea to enhance any other notation - piano rolls, standard notation, jianpu, guitar tabs.

## Visual system

### 12 colors

Goals:

- give each of the 12 notes in an octave a unique color, starting from the local tonic
- give most basic colors to most popular notes
- make minor and major modes sharply distinguishable
- draw rest of the notes somewhat from the rainbow, but use semantically unsettling colors for rare notes

Non-goals:

- draw colors exactly from the rainbow. if possible, color palette should help exploring semantics

Solution:

- [TWELVE_TONE_COLORS](https://github.com/vpavlenko/chiptheory/blob/master/src/components/chiptheory/romanNumerals.tsx#L221)

Rationale:

- four most important colors are red (tonic), yellow (minor third), light green (major third), blue (fifth)
- dominant (V and V7) has very catchy blue-violet-pink gradient (four shades)
- natural major has two green shades, no yellow shades
- natural minor has yellow, orange and brown, nothing green
- thirds and sixths are rhyming (light/dark yellow/green) - helps with mediant chords
- to many genres, a definition of a local tonic will be "a picked starting note that maximizes amount of red and blue on a screen"
- lower/raised 6 and lower/raised 7 are all used in certain minor/major modes, so all four should be easy-to-name and distinguishable
- gray is pretty rare, absent in some tracks. it's usage is lydian, V/V and blues scale. gray as a color should be in this schema because it's too good to throw out - it will work with both black and white backgrounds, it's a basic one
- dark red is for phrygian and bII (tritone sub) or N6 - also rare and unique
- the coloring somewhat matches the one from Hooktheory and somewhat is drawn from the rainbow, so it's an easy switch from Hooktheory books (lovely ones!) to my system

Any color scheme will work just fine - that is, an eye will rapidly start extracting harmonic patterns given any color scheme of 12 contrasting colors. The improvements should help seeing more popular chords faster and make them easier/more intuitive/mnemonic to remember. The idea is about having some 12 colors, consistently from a tonic (movable-do), without any mixing between modes (without homonyms).

### Chord tones

In a harmonic analysis, we choose a root. In most cases, a root is one of the notes of a measure in question, so a simple interactive harmonic analysis allows hovering on notes, observing note meaning (interval) relative to a hovered root and choosing a root by clicking on it.

The exact quality of a chord can be approximately calculated by [ratio of minor thirds to major thirds](https://github.com/vpavlenko/chiptheory/blob/master/src/components/chiptheory/romanNumerals.tsx#L126), substantial presence of sevenths, diminished/perfect fifth.

In many genres, it probably doesn't make sense to carefully infer and store a chord inversion.

Note meanings according to current root should be labeled on the notes - as a note(head) text. Where possible, numbers should be used. A minor third should be clearly distinct from a major third (I chose "III"). Chord tones prominent in certain chords can use these chords' symbols as a mnemonic: ▵ for I▵, + for V+, b for b9. Should "T" be a "o" instead?

- [TWELVE_CHORD_TONES](https://github.com/vpavlenko/chiptheory/blob/master/src/components/chiptheory/romanNumerals.tsx#L78)

### Modulation

An abrupt modulation is a simple change of a tonic note. Two regions will be visibly different since all horizontal color stripes will be shifted.

A pivot chord modulation where one or more chords have functional meaning in both keys can be visualized as a curtain inviting to hover/drag an exact place of recoloring, or as a blinking (or as a gradient?)

The concept of modulation vs. tonicization can be expressed in gradual hierarchy, where at lowest level every chord makes its own key and its root is red. (This requires harmonic analysis.) So, red should always correspond to a "." root doot. At highest level there's a single red shared by all sections. Applied chords adjacent to their targets can have a hover interface to momentarily recolor their region.

## Input formats

### MIDI

MIDI files can be dropped into https://vpavlenko.github.io/chiptheory for visualization. Saving for user files isn't supported yet (contact me). Additionally, there's a decent built-in MIDI library coming from Chip Player JS project: [rock/pop](https://vpavlenko.github.io/chiptheory/browse/MIDI/), [classical](https://vpavlenko.github.io/chiptheory/browse/Classical%20MIDI), [jazz](https://vpavlenko.github.io/chiptheory/browse/Jazz%20MIDI)

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
