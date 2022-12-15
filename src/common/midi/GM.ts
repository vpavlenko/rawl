import { localized } from "../localize/localizedString"

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
