/**
  tempos = [
    {
      tempo: <Number>,
      time: <Number>
    },
    ...
  ]
*/
class NoteCoordConverter {
  constructor(pixelsPerSecond, pixelsPerKey, tempos, timebase) {
    this.pixelsPerSecond = pixelsPerSecond
    this.pixelsPerKey = pixelsPerKey
    this.tempos = tempos
    this.timebase = timebase
  }

  getSecondsAtTime(time) {
    var prev = this.tempos[0]
    var total = 0
    const timebase = this.timebase / 60 // in seconds
    for (const i in this.tempos) {
      const tempo = this.tempos[i]
      if (tempo.time > time) break
      const deltaTime = Math.max(tempo.time, time) - prev.time
      const deltaInSec = deltaTime / prev.tempo / timebase
      total += deltaInSec
      prev = tempo
    }
    return total
  }

  getPixelsAtTime(time) {
    return this.getSeconds(time) * this.pixelsPerSecond
  }

  getTempoAtTime(time) {
    var tempo = this.tempos[0]
    for (const i in this.tempos) {
      const t = this.tempos[i]
      if (t.time > time) break
      tempo = t
    }
    return tempo.tempo
  }

  getPixelsPerBeatAtTime(time) {
    const sec = this.getTempoAtTime(time) / timebase / 60
    return sec * this.pixelsPerSecond
  }

  getPixelsPerSecond() {
    return this.pixelsPerSecond
  }

  getPixelsPerKey() {
    return this.pixelsPerKey
  }
}
