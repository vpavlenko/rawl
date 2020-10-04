export class AdaptiveTimer {
  private onTimer: (timestamp: number) => void
  private prevTimestamp: number | null = null
  private interval: number
  private timeout: number | undefined
  private enable: boolean = false

  constructor(onTimer: (timestamp: number) => void, interval: number) {
    this.onTimer = onTimer
    this.interval = interval
  }

  start() {
    this.stop()
    this.enable = true
    this.onTick()
  }

  stop() {
    if (this.timeout !== undefined) {
      window.clearTimeout(this.timeout)
    }
    this.enable = false
  }

  onTick() {
    if (!this.enable) {
      return
    }
    const timestampBefore = window.performance.now()
    this.onTimer(timestampBefore)
    const timestampAfter = window.performance.now()

    const processTime = timestampAfter - timestampBefore

    if (this.prevTimestamp !== null) {
      const jitter = this.interval - (timestampBefore - this.prevTimestamp)
      if (jitter / this.interval > 2) {
        console.warn(`timer have big jitter: ${jitter}`)
      }
    }

    this.prevTimestamp = timestampAfter
    this.timeout = window.setTimeout(
      () => this.onTick(),
      this.interval - processTime
    )
  }
}
