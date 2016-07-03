const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
]
function noteNumberString(noteNumber) {
  const oct = Math.floor(noteNumber / 12) - 1
  const key = noteNumber % 12
  return `${NOTE_NAMES[key]} ${oct} (${noteNumber})`
}
