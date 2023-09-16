import { SynthEvent } from "@ryohey/wavelet"
import Song from "../song"

const tickToMillisec = (tick: number, bpm: number, timebase: number) =>
  (tick / (timebase / 60) / bpm) * 1000

interface Keyframe {
  tick: number
  bpm: number
  timestamp: number
}

export const songToSynthEvents = (
  song: Song,
  sampleRate: number,
): SynthEvent[] => {
  const events = [...song.allEvents].sort((a, b) => a.tick - b.tick)

  let keyframe: Keyframe = {
    tick: 0,
    bpm: 120,
    timestamp: 0,
  }

  const synthEvents: SynthEvent[] = []

  // channel イベントを MIDI Output に送信
  // Send Channel Event to MIDI OUTPUT
  for (const e of events) {
    const timestamp =
      tickToMillisec(e.tick - keyframe.tick, keyframe.bpm, song.timebase) +
      keyframe.timestamp
    const delayTime = (timestamp / 1000) * sampleRate

    switch (e.type) {
      case "channel":
        synthEvents.push({
          type: "midi",
          midi: e,
          delayTime,
        })
      case "meta":
        switch (e.subtype) {
          case "setTempo":
            keyframe = {
              tick: e.tick,
              bpm: (60 * 1000000) / e.microsecondsPerBeat,
              timestamp,
            }
            break
        }
    }
  }

  return synthEvents
}
