import { SynthEvent } from "@ryohey/wavelet"
import Song from "../song"

const tickToMillisec = (tick: number, bpm: number, timebase: number) =>
  (tick / (timebase / 60) / bpm) * 1000

export const songToSynthEvents = (
  song: Song,
  sampleRate: number
): SynthEvent[] => {
  const events = [...song.allEvents].sort((a, b) => a.tick - b.tick)

  const now = 0
  let bpm = 120

  const synthEvents: SynthEvent[] = []

  // channel イベントを MIDI Output に送信
  // Send Channel Event to MIDI OUTPUT
  for (const e of events) {
    const timestamp = tickToMillisec(e.tick, bpm, song.timebase)
    const delayTime = ((timestamp - now) / 1000) * sampleRate

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
            bpm = (60 * 1000000) / e.microsecondsPerBeat
            break
        }
    }
  }

  return synthEvents
}
