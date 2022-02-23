import { localized } from "../localize/localizedString"

const GMMap = {
  Piano: [
    "Acoustic Grand Piano",
    "Bright Acoustic Piano",
    "Electric Grand Piano",
    "Honky-tonk Piano",
    "Electric Piano 1",
    "Electric Piano 2",
    "Harpsichord",
    "Clavinet",
  ],
  "Chromatic Percussion": [
    "Celesta",
    "Glockenspiel",
    "Music Box",
    "Vibraphone",
    "Marimba",
    "Xylophone",
    "Tubular Bells",
    "Dulcimer",
  ],
  Organ: [
    "Drawbar Organ",
    "Percussive Organ",
    "Rock Organ",
    "Church Organ",
    "Reed Organ",
    "Accordion",
    "Harmonica",
    "Tango Accordion",
  ],
  Guitar: [
    "Acoustic Guitar (nylon)",
    "Acoustic Guitar (steel)",
    "Electric Guitar (jazz)",
    "Electric Guitar (clean)",
    "Electric Guitar (muted)",
    "Overdriven Guitar",
    "Distortion Guitar",
    "Guitar Harmonics",
  ],
  Bass: [
    "Acoustic Bass",
    "Electric Bass (finger)",
    "Electric Bass (pick)",
    "Fretless Bass",
    "Slap Bass 1",
    "Slap Bass 2",
    "Synth Bass 1",
    "Synth Bass 2",
  ],
  Strings: [
    "Violin",
    "Viola",
    "Cello",
    "Contrabass",
    "Tremolo Strings",
    "Pizzicato Strings",
    "Orchestral Harp",
    "Timpani",
  ],
  Ensemble: [
    "String Ensemble 1",
    "String Ensemble 2",
    "Synth Strings 1",
    "Synth Strings 2",
    "Choir Aahs",
    "Voice Oohs",
    "Synth Choir",
    "Orchestra Hit",
  ],
  Brass: [
    "Trumpet",
    "Trombone",
    "Tuba",
    "Muted Trumpet",
    "French Horn",
    "Brass Section",
    "Synth Brass 1",
    "Synth Brass 2",
  ],
  Reed: [
    "Soprano Sax",
    "Alto Sax",
    "Tenor Sax",
    "Baritone Sax",
    "Oboe",
    "English Horn",
    "Bassoon",
    "Clarinet",
  ],
  Pipe: [
    "Piccolo",
    "Flute",
    "Recorder",
    "Pan Flute",
    "Blown Bottle",
    "Shakuhachi",
    "Whistle",
    "Ocarina",
  ],
  "Synth Lead": [
    "Lead 1 (square)",
    "Lead 2 (sawtooth)",
    "Lead 3 (calliope)",
    "Lead 4 (chiff)",
    "Lead 5 (charang)",
    "Lead 6 (voice)",
    "Lead 7 (fifths)",
    "Lead 8 (bass + lead)",
  ],
  "Synth Pad": [
    "Pad 1 (new age)",
    "Pad 2 (warm)",
    "Pad 3 (polysynth)",
    "Pad 4 (choir)",
    "Pad 5 (bowed)",
    "Pad 6 (metallic)",
    "Pad 7 (halo)",
    "Pad 8 (sweep)",
  ],
  "Synth Effects": [
    "FX 1 (rain)",
    "FX 2 (soundtrack)",
    "FX 3 (crystal)",
    "FX 4 (atmosphere)",
    "FX 5 (brightness)",
    "FX 6 (goblins)",
    "FX 7 (echoes)",
    "FX 8 (sci-fi)",
  ],
  Ethnic: [
    "Sitar",
    "Banjo",
    "Shamisen",
    "Koto",
    "Kalimba",
    "Bagpipe",
    "Fiddle",
    "Shanai",
  ],
  Percussive: [
    "Tinkle Bell",
    "Agogo",
    "Steel Drums",
    "Woodblock",
    "Taiko Drum",
    "Melodic Tom",
    "Synth Drum",
    "Reverse Cymbal",
  ],
  "Sound effects": [
    "Guitar Fret Noise",
    "Breath Noise",
    "Seashore",
    "Bird Tweet",
    "Telephone Ring",
    "Helicopter",
    "Applause",
    "Gunshot",
  ],
} as { [key: string]: string[] }

// programNumber は 0 から始まる数
export function getInstrumentName(programNumber: number): string | undefined {
  const ids = getGMMapIndexes(programNumber)
  if (ids === undefined) {
    return undefined
  }
  return GMMap[Object.keys(GMMap)[ids[0]]][ids[1]]
}

// category, instrument の index を返す
function getGMMapIndexes(programNumber: number): [number, number] | undefined {
  let i = programNumber
  let n = 0
  for (const key in GMMap) {
    const len = GMMap[key].length
    if (i - len < 0) {
      return [n, i]
    }
    i -= len
    n++
  }
  return undefined
}

export const fancyCategoryNames = [
  `🎹 ${localized("Piano", "Piano")}`,
  `🔔 ${localized("Chromatic Percussion", "Chromatic Percussion")}`,
  `🎹 ${localized("Organ", "Organ")}`,
  `🎸 ${localized("Guitar", "Guitar")}`,
  `🎸 ${localized("Bass", "Bass")}`,
  `🎻 ${localized("Strings", "Strings")}`,
  `🧑‍🤝‍🧑 ${localized("Ensemble", "Ensemble")}`,
  `🎺 ${localized("Brass", "Brass")}`,
  `🎷 ${localized("Reed", "Reed")}`,
  `🍾 ${localized("Pipe", "Pipe")}`,
  `🕹️ ${localized("Synth Lead", "Synth Lead")}`,
  `🔮 ${localized("Synth Pad", "Synth Pad")}`,
  `⚡ ${localized("Synth Effects", "Synth Effects")}`,
  `🍛 ${localized("Ethnic", "Ethnic")}`,
  `🥁 ${localized("Percussive", "Percussive")}`,
  `🚁 ${localized("Sound effects", "Sound effects")}`,
]
