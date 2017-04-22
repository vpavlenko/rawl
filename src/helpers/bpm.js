const MINUTE = 60 * 1000000

export function uSecPerBeatToBPM(microsecondsPerBeat) {
  return MINUTE / microsecondsPerBeat
}

export function bpmToUSecPerBeat(bpm) {
  return MINUTE / bpm
}
