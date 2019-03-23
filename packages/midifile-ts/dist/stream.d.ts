export interface Data<T> extends Iterable<T> {
    [key: number]: T;
    slice(start?: T, end?: T): Data<T>;
    readonly length: number;
}
export default class Stream {
    private buf;
    private position;
    constructor(buf: Data<number>);
    readByte(): number;
    readStr(length: number): string;
    read(length: number): Data<number>;
    readInt32(): number;
    readInt16(): number;
    readInt8(signed?: boolean): number;
    eof(): boolean;
    readVarInt(): number;
}
