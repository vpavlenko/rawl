"use strict"
/**
  tempos = [
    {
      tempo: <Number>,
      tick: <Number>
    },
    ...
  ]
*/
class NoteCoordConverter {
  constructor(pixelsPerBeat, pixelsPerKey, tempos, timebase, maxNoteNumber) {
    this.pixelsPerBeat = pixelsPerBeat
    this.pixelsPerKey = pixelsPerKey
    this.tempos = tempos
    this.timebase = timebase
    this.maxNoteNumber = maxNoteNumber - 3
    bindAllMethods(this)
  }

  // seconds

  getSecondsAt(tick) {
    var prev = this.tempos[0]
    var total = 0
    const timebase = this.timebase / 60 // in seconds
    for (const tempo of this.tempos) {
      if (tempo.tick > tick) break
      const deltaTime = Math.max(tempo.tick, tick) - prev.tick
      const deltaInSec = deltaTime / prev.tempo / timebase
      total += deltaInSec
      prev = tempo
    }
    return total
  }

  getTempoAt(tick) {
    for (const t of this.tempos) {
      if (t.tick > tick) break
      tempo = t
    }
    return tempo.tempo
  }

  // pixels

  getPixelsAt(tick) {
    return Math.floor(tick / this.timebase * this.pixelsPerBeat)
  }

  getPixelsAtBeats(beats) {
    return Math.floor(this.getPixelsAt(beats * this.timebase))
  }

  getPixelsForNoteNumber(noteNum) {
    return Math.floor((this.maxNoteNumber - noteNum) * this.pixelsPerKey)
  }

  // ticks

  getTicksForPixels(pixels) {
    return pixels / this.pixelsPerBeat * this.timebase
  }

  getNoteNumberForPixels(pixels) {
    return (this.maxNoteNumber - pixels / this.pixelsPerKey)
  }

  // 

  eventToRect(noteEvent) {
    const start = this.getPixelsAt(noteEvent.tick)
    const end = this.getPixelsAt(noteEvent.tick + noteEvent.duration)
    return {
      id: noteEvent.id,
      x: start,
      y: this.getPixelsForNoteNumber(noteEvent.noteNumber),
      width: end - start,
      height: this.pixelsPerKey,
      velocity: noteEvent.velocity
    }
  }
}
