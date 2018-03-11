interface TempoItem {
  tempo: number
  tick: number
}

export default class NoteTimeTransform {
  private _tempos: TempoItem[]
  private _timebase: number

  constructor(tempos: TempoItem[], timebase: number) {
    this._tempos = tempos
    this._timebase = timebase
  }

  // seconds

  getSeconds(tick: number) {
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

  getTempoAt(tick: number) {
    let tempo = this._tempos[0] && this._tempos[0].tempo || 120
    for (const t of this._tempos) {
      if (t.tick > tick) break
      tempo = t.tempo
    }
    return tempo
  }
}
