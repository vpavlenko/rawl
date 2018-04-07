export interface Message<T> {
    time: number;
    body: T;
}
export interface LiveMessage<T> extends Message<T> {
    timestamp: number;
}
export interface Output<T> {
    sendMessages(messages: LiveMessage<T>[], timestamp: number): void;
}
export interface DataSource<T> {
    /**
     * 指定した範囲の時間のメッセージを取得する
     * @param from milliseconds
     * @param to milliseconds
     */
    getMessages(from: number, to: number): Message<T>[];
}
export interface LoopSetting {
    begin: number;
    end: number;
    enabled: boolean;
}
/**
 * Player でイベントを随時読み取るためのクラス
 * 精確にスケジューリングするために先読みを行う
 * https://www.html5rocks.com/ja/tutorials/audio/scheduling/
 *
 * これ自体はタイミングを指示するだけで、具体的な midi のメッセージ等を知らない
 *
 * Message[] @ DataSource -> LiveMessage[] @ Sequencer -> Output
 */
export default class Sequencer<T> {
    private readonly dataSource;
    private readonly output;
    private readonly interval;
    private readonly lookAhead;
    private startTime;
    private startTimeRelative;
    private scheduledTime;
    private intervalId;
    loop: LoopSetting;
    /**
     * @param dataSource Message Source
     * @param output Message Destination
     * @param interval milliseconds
     * @param lookAhead milliseconds
     */
    constructor(dataSource: DataSource<T>, output: Output<T>, interval: number, lookAhead: number);
    resume(): void;
    seek(time: number): void;
    play(time: number): void;
    pause(): void;
    readonly isPlaying: boolean;
    /**
     * 一定間隔で呼ばれ、先読みしながらメッセージを output に送信する
     *  テスト用に公開
     */
    onTimer(timestamp?: number): void;
}
