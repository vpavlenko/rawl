export interface Message<T> {
  time: number // milliseconds
  body: T
}

export interface LiveMessage<T> extends Message<T> {
  timestamp: number
}

export interface Output<T> {
  sendMessages(messages: LiveMessage<T>[], timestamp: number): void
}

export interface DataSource<T> {
  /**
   * 指定した範囲の時間のメッセージを取得する
   * @param from milliseconds
   * @param to milliseconds
   */
  getMessages(from: number, to: number): Message<T>[]
}

export interface LoopSetting {
  begin: number
  end: number
  enabled: boolean
}

/**
 * Player でイベントを随時読み取るためのクラス
 * 精確にスケジューリングするために先読みを行う
 * https://www.html5rocks.com/ja/tutorials/audio/scheduling/
 * https://wwwHtml5RocksCom/ja/tutorials/audio/scheduling/
 *
 * これ自体はタイミングを指示するだけで、具体的な midi のメッセージ等を知らない
 *
 * Message[] @ DataSource -> LiveMessage[] @ Sequencer -> Output
 */
/**
 * Player Classes for reading events at any time
 * Perform prefetching for accurate scheduling
 * https://www.html5rocks.com/ja/tutorials/audio/scheduling/
 *
 * This themselves do not know specific MIDI messages only by instructing timing
 *
 * Message[] @ DataSource -> LiveMessage[] @ Sequencer -> Output
 */
export default class Sequencer<T> {
  private readonly dataSource: DataSource<T>
  private readonly output: Output<T>

  // タイマーの間隔
  // Timer interval
  private readonly interval: number

  // 先読み時間
  // Leading time
  private readonly lookAhead: number

  // 再生開始時刻
  // Regeneration start time
  private startTime: number | null = null

  // 再生開始時の相対時間
  // Relative time at start of reproduction
  private startTimeRelative: number | null = null

  // スケジュール済みの相対時間
  // Scheduled relative time
  private scheduledTime: number = 0

  private intervalId: any // Timer (node) or number (browser)

  loop: LoopSetting = {
    begin: 0,
    end: 0,
    enabled: false,
  }

  /**
   * @param dataSource Message Source
   * @param output Message Destination
   * @param interval milliseconds
   * @param lookAhead milliseconds
   */
  constructor(
    dataSource: DataSource<T>,
    output: Output<T>,
    interval: number,
    lookAhead: number
  ) {
    this.dataSource = dataSource
    this.output = output
    this.interval = interval
    this.lookAhead = lookAhead
  }

  resume(): void {
    if (this.intervalId < 0) {
      this.intervalId = setInterval(() => this.onTimer(), this.interval)
      this.startTime = null
      this.startTimeRelative = null
    }
  }

  seek(time: number): void {
    this.scheduledTime = time
    this.startTime = null
    this.startTimeRelative = null
  }

  play(time: number): void {
    this.seek(time)
    this.resume()
  }

  pause(): void {
    clearInterval(this.intervalId)
    this.intervalId = -1
  }

  get isPlaying(): boolean {
    return this.intervalId >= 0
  }

  /**
   * 一定間隔で呼ばれ、先読みしながらメッセージを output に送信する
   *  テスト用に公開
   */
  onTimer(timestamp: number = performance.now()): void {
    if (this.startTime === null) {
      this.startTime = timestamp
    }
    if (this.startTimeRelative === null) {
      this.startTimeRelative = this.scheduledTime
    }
    const nowTime = this.startTimeRelative + timestamp - this.startTime

    // 前回スケジュール済みの時点から、
    // From the previous scheduled point,
    // 先読み時間までを処理の対象とする
    // Target of processing up to read time
    const fromTime = this.scheduledTime
    const toTime = nowTime + this.lookAhead

    const msgs: LiveMessage<T>[] = this.dataSource
      .getMessages(fromTime, toTime)
      .map((message) => ({
        ...message,
        timestamp: timestamp + message.time - nowTime,
      }))

    this.output.sendMessages(msgs, nowTime)

    this.scheduledTime = toTime

    if (this.loop.enabled && toTime >= this.loop.end) {
      this.seek(this.loop.begin)
    }
  }
}
