export interface Message {
  message: number[]
  timestamp: number
}

export interface SynthOutput {
  activate(): void
  sendEvents(events: Message[]): void
}
