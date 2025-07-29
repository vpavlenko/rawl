// custom.d.ts
declare module "*.png" {
  const value: string;
  export default value;
}

// Type definitions for MIDIPlayer
declare module "*/MIDIPlayer" {
  import { EventEmitter } from "events";

  export default class MIDIPlayer extends EventEmitter {
    on(event: "playerStateUpdate", listener: (state: any) => void): this;
    on(event: "playerError", listener: (message: string) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    emit(event: "playerStateUpdate", state: any): boolean;
    emit(event: "playerError", message: string): boolean;
    emit(event: string | symbol, ...args: any[]): boolean;

    // Add other methods that are being used
    loadData(
      data: Uint8Array,
      filepath: string,
      shouldAutoPlay?: boolean,
    ): Promise<any>;
    isPlaying(): boolean;
    togglePause(): boolean;
    getPositionMs(): number;
    seekMs(ms: number): void;
    setTempo(tempo: number): void;
    getNumVoices(): number;
    setVoiceMask(voiceMask: boolean[]): void;
    setParameter(id: string, value: any): void;
    suspend(): void;
    eject(): void;
    pause(): void;
    setPlaybackStartedCallback(callback: (() => void) | null): void;
  }
}
