export default class Recorder {
  constructor(ctx: AudioContext, options: any)
  addEventListener(name: string, handler: (e: any) => void): void
  initStream(node: AudioNode): void
  start(): void
  stop(): void
}
