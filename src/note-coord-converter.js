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
    var prev = {
      tempo: 0,
      time: 0
    }
    var total = 0
    var timebase = this.timebase / 60 // in seconds
    for (var i in this.tempos) {
      var tempo = this.tempos[i]
      var deltaTime = Math.max(tempo.time, time) - prev.time
      var deltaInSec = deltaTime / prev.tempo / timebase
      total += deltaInSec
      if (tempo.time >= time) break
    }
    return total
  }

  getPixelsAtTime(time) {
    return this.getSeconds(time) * this.pixelsPerSecond
  }

  getTempoAtTime(time) {
    var tempo
    for (var i in this.tempos) {
      if (tempo.time >= time) break
      tempo = this.tempos[i]
    }
    return tempo
  }

  getPixelsPerBeatAtTime(time) {
    var sec = getTempoAtTime(time).tempo / timebase / 60
    return sec * this.pixelsPerSecond
  }

  getPixelsPerSecond() {
    return this.pixelsPerSecond
  }

  getPixelsPerKey() {
    return this.pixelsPerKey
  }
}
