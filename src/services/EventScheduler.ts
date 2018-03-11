/**
 * Player でイベントを随時読み取るためのクラス
 * 精確にスケジューリングするために先読みを行う
 * https://www.html5rocks.com/ja/tutorials/audio/scheduling/
 */
export default class EventScheduler {
  // 先読み時間 (ms)
  lookAheadTime = 100

  // 1/4 拍子ごとの tick 数
  timebase = 480

  _currentTick = 0
  _scheduledTick = 0
  _prevTime = undefined
  _events: any[]

  constructor(events = [], tick = 0, timebase = 480, lookAheadTime = 100) {
    this._events = events
    this._currentTick = tick
    this._scheduledTick = tick
    this.timebase = timebase
  }

  get currentTick() {
    return this._currentTick
  }

  millisecToTick(ms, bpm) {
    return ms / 1000 * bpm / 60 * this.timebase
  }

  tickToMillisec(tick, bpm) {
    return tick / (this.timebase / 60) / bpm * 1000
  }

  seek(tick) {
    this._currentTick = this._scheduledTick = Math.max(0, tick)
  }

  readNextEvents(bpm, timestamp) {
    if (this._prevTime === undefined) {
      this._prevTime = timestamp
    }
    const delta = timestamp - this._prevTime
    const nowTick = Math.floor(this._currentTick + Math.max(0, this.millisecToTick(delta, bpm)))

    // 先読み時間
    const lookAheadTick = Math.floor(this.millisecToTick(this.lookAheadTime, bpm))

    // 前回スケジュール済みの時点から、
    // 先読み時間までを処理の対象とする
    const startTick = this._scheduledTick
    const endTick = nowTick + lookAheadTick

    this._prevTime = timestamp
    this._currentTick = nowTick
    this._scheduledTick = endTick

    return this._events
      .filter(e => e && e.tick >= startTick && e.tick < endTick)
      .map(e => {
        const waitTick = e.tick - nowTick
        const delayedTime = timestamp + Math.max(0, this.tickToMillisec(waitTick, bpm))
        return { event: e, timestamp: delayedTime }
      })
  }
}
