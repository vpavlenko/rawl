import { AnyEvent } from "./event";
import { Data } from "./stream";
export default function read(data: Data<number>): {
    header: {
        formatType: number;
        trackCount: number;
        ticksPerBeat: number;
    };
    tracks: AnyEvent[][];
};
