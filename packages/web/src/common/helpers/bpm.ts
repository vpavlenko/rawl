const MINUTE = 60 * 1000000

export function uSecPerBeatToBPM(microsecondsPerBeat: number) {
  return MINUTE / microsecondsPerBeat
}

export function bpmToUSecPerBeat(bpm: number) {
  return MINUTE / bpm
}
