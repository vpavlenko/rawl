export default class NoteTimeTransform {
  /**
    tempos = [
      {
        tempo: <Number>,
        tick: <Number>
      },
      ...
    ]
  */
  constructor(tempos, timebase) {
    this._tempos = tempos
    this._timebase = timebase
  }

  // seconds

  getSeconds(tick) {
    var prev = this._tempos[0]
    var total = 0
    const timebase = this._timebase / 60 // in seconds
    for (const tempo of this._tempos) {
      if (tempo.tick > tick) break
      const deltaTime = Math.max(tempo.tick, tick) - prev.tick
      const deltaInSec = deltaTime / prev.tempo / timebase
      total += deltaInSec
      prev = tempo
    }
    return total
  }

  getTempoAt(tick) {
    for (const t of this._tempos) {
      if (t.tick > tick) break
      tempo = t
    }
    return tempo.tempo
  }
}
