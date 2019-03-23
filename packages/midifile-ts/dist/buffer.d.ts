export default class Buffer {
    data: number[];
    readonly length: number;
    writeByte(v: number, pos?: number): void;
    writeStr(str: string): void;
    writeInt32(v: number, pos?: number): void;
    writeInt16(v: number, pos?: number): void;
    writeBytes(arr: number[]): void;
    writeChunk(id: string, func: (buf: Buffer) => void): void;
    toBytes(): Uint8Array;
}
