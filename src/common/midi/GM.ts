import { localized } from "../localize/localizedString"

const instrumentNames = [
  // Piano
  localized("Acoustic Grand Piano", "Acoustic Grand Piano"),
  localized("Bright Acoustic Piano", "Bright Acoustic Piano"),
  localized("Electric Grand Piano", "Electric Grand Piano"),
  localized("Honky-tonk Piano", "Honky-tonk Piano"),
  localized("Electric Piano 1", "Electric Piano 1"),
  localized("Electric Piano 2", "Electric Piano 2"),
  localized("Harpsichord", "Harpsichord"),
  localized("Clavinet", "Clavinet"),

  // Chromatic Percussion
  localized("Celesta", "Celesta"),
  localized("Glockenspiel", "Glockenspiel"),
  localized("Music Box", "Music Box"),
  localized("Vibraphone", "Vibraphone"),
  localized("Marimba", "Marimba"),
  localized("Xylophone", "Xylophone"),
  localized("Tubular Bells", "Tubular Bells"),
  localized("Dulcimer", "Dulcimer"),

  // Organ
  localized("Drawbar Organ", "Drawbar Organ"),
  localized("Percussive Organ", "Percussive Organ"),
  localized("Rock Organ", "Rock Organ"),
  localized("Church Organ", "Church Organ"),
  localized("Reed Organ", "Reed Organ"),
  localized("Accordion", "Accordion"),
  localized("Harmonica", "Harmonica"),
  localized("Tango Accordion", "Tango Accordion"),

  // Guitar
  localized("Acoustic Guitar (nylon)", "Acoustic Guitar (nylon)"),
  localized("Acoustic Guitar (steel)", "Acoustic Guitar (steel)"),
  localized("Electric Guitar (jazz)", "Electric Guitar (jazz)"),
  localized("Electric Guitar (clean)", "Electric Guitar (clean)"),
  localized("Electric Guitar (muted)", "Electric Guitar (muted)"),
  localized("Overdriven Guitar", "Overdriven Guitar"),
  localized("Distortion Guitar", "Distortion Guitar"),
  localized("Guitar Harmonics", "Guitar Harmonics"),

  // Bass
  localized("Acoustic Bass", "Acoustic Bass"),
  localized("Electric Bass (finger)", "Electric Bass (finger)"),
  localized("Electric Bass (pick)", "Electric Bass (pick)"),
  localized("Fretless Bass", "Fretless Bass"),
  localized("Slap Bass 1", "Slap Bass 1"),
  localized("Slap Bass 2", "Slap Bass 2"),
  localized("Synth Bass 1", "Synth Bass 1"),
  localized("Synth Bass 2", "Synth Bass 2"),

  // Strings
  localized("Violin", "Violin"),
  localized("Viola", "Viola"),
  localized("Cello", "Cello"),
  localized("Contrabass", "Contrabass"),
  localized("Tremolo Strings", "Tremolo Strings"),
  localized("Pizzicato Strings", "Pizzicato Strings"),
  localized("Orchestral Harp", "Orchestral Harp"),
  localized("Timpani", "Timpani"),

  // Ensemble
  localized("String Ensemble 1", "String Ensemble 1"),
  localized("String Ensemble 2", "String Ensemble 2"),
  localized("Synth Strings 1", "Synth Strings 1"),
  localized("Synth Strings 2", "Synth Strings 2"),
  localized("Choir Aahs", "Choir Aahs"),
  localized("Voice Oohs", "Voice Oohs"),
  localized("Synth Choir", "Synth Choir"),
  localized("Orchestra Hit", "Orchestra Hit"),

  // Brass
  localized("Trumpet", "Trumpet"),
  localized("Trombone", "Trombone"),
  localized("Tuba", "Tuba"),
  localized("Muted Trumpet", "Muted Trumpet"),
  localized("French Horn", "French Horn"),
  localized("Brass Section", "Brass Section"),
  localized("Synth Brass 1", "Synth Brass 1"),
  localized("Synth Brass 2", "Synth Brass 2"),

  // Reed
  localized("Soprano Sax", "Soprano Sax"),
  localized("Alto Sax", "Alto Sax"),
  localized("Tenor Sax", "Tenor Sax"),
  localized("Baritone Sax", "Baritone Sax"),
  localized("Oboe", "Oboe"),
  localized("English Horn", "English Horn"),
  localized("Bassoon", "Bassoon"),
  localized("Clarinet", "Clarinet"),

  // Pipe
  localized("Piccolo", "Piccolo"),
  localized("Flute", "Flute"),
  localized("Recorder", "Recorder"),
  localized("Pan Flute", "Pan Flute"),
  localized("Blown Bottle", "Blown Bottle"),
  localized("Shakuhachi", "Shakuhachi"),
  localized("Whistle", "Whistle"),
  localized("Ocarina", "Ocarina"),

  // Synth Lead
  localized("Lead 1 (square)", "Lead 1 (square)"),
  localized("Lead 2 (sawtooth)", "Lead 2 (sawtooth)"),
  localized("Lead 3 (calliope)", "Lead 3 (calliope)"),
  localized("Lead 4 (chiff)", "Lead 4 (chiff)"),
  localized("Lead 5 (charang)", "Lead 5 (charang)"),
  localized("Lead 6 (voice)", "Lead 6 (voice)"),
  localized("Lead 7 (fifths)", "Lead 7 (fifths)"),
  localized("Lead 8 (bass + lead)", "Lead 8 (bass + lead)"),

  // Synth Pad
  localized("Pad 1 (new age)", "Pad 1 (new age)"),
  localized("Pad 2 (warm)", "Pad 2 (warm)"),
  localized("Pad 3 (polysynth)", "Pad 3 (polysynth)"),
  localized("Pad 4 (choir)", "Pad 4 (choir)"),
  localized("Pad 5 (bowed)", "Pad 5 (bowed)"),
  localized("Pad 6 (metallic)", "Pad 6 (metallic)"),
  localized("Pad 7 (halo)", "Pad 7 (halo)"),
  localized("Pad 8 (sweep)", "Pad 8 (sweep)"),

  // Synth Effects
  localized("FX 1 (rain)", "FX 1 (rain)"),
  localized("FX 2 (soundtrack)", "FX 2 (soundtrack)"),
  localized("FX 3 (crystal)", "FX 3 (crystal)"),
  localized("FX 4 (atmosphere)", "FX 4 (atmosphere)"),
  localized("FX 5 (brightness)", "FX 5 (brightness)"),
  localized("FX 6 (goblins)", "FX 6 (goblins)"),
  localized("FX 7 (echoes)", "FX 7 (echoes)"),
  localized("FX 8 (sci-fi)", "FX 8 (sci-fi)"),

  // Ethnic
  localized("Sitar", "Sitar"),
  localized("Banjo", "Banjo"),
  localized("Shamisen", "Shamisen"),
  localized("Koto", "Koto"),
  localized("Kalimba", "Kalimba"),
  localized("Bagpipe", "Bagpipe"),
  localized("Fiddle", "Fiddle"),
  localized("Shanai", "Shanai"),

  // Percussive
  localized("Tinkle Bell", "Tinkle Bell"),
  localized("Agogo", "Agogo"),
  localized("Steel Drums", "Steel Drums"),
  localized("Woodblock", "Woodblock"),
  localized("Taiko Drum", "Taiko Drum"),
  localized("Melodic Tom", "Melodic Tom"),
  localized("Synth Drum", "Synth Drum"),
  localized("Reverse Cymbal", "Reverse Cymbal"),

  // Sound effects
  localized("Guitar Fret Noise", "Guitar Fret Noise"),
  localized("Breath Noise", "Breath Noise"),
  localized("Seashore", "Seashore"),
  localized("Bird Tweet", "Bird Tweet"),
  localized("Telephone Ring", "Telephone Ring"),
  localized("Helicopter", "Helicopter"),
  localized("Applause", "Applause"),
  localized("Gunshot", "Gunshot"),
]

// programNumber は 0 から始まる数
export function getInstrumentName(programNumber: number): string | undefined {
  return instrumentNames[programNumber]
}

export const getCategoryIndex = (programNumber: number) =>
  Math.floor(programNumber / 8)

export const categoryEmojis = [
  "🎹",
  "🔔",
  "🎹",
  "🎸",
  "🎸",
  "🎻",
  "🧑‍🤝‍🧑",
  "🎺",
  "🎷",
  "🍾",
  "🕹️",
  "🔮",
  "⚡",
  "🍛",
  "🥁",
  "🚁",
]

export const categoryNames = [
  localized("Piano", "Piano"),
  localized("Chromatic Percussion", "Chromatic Percussion"),
  localized("Organ", "Organ"),
  localized("Guitar", "Guitar"),
  localized("Bass", "Bass"),
  localized("Strings", "Strings"),
  localized("Ensemble", "Ensemble"),
  localized("Brass", "Brass"),
  localized("Reed", "Reed"),
  localized("Pipe", "Pipe"),
  localized("Synth Lead", "Synth Lead"),
  localized("Synth Pad", "Synth Pad"),
  localized("Synth Effects", "Synth Effects"),
  localized("Ethnic", "Ethnic"),
  localized("Percussive", "Percussive"),
  localized("Sound effects", "Sound effects"),
]
