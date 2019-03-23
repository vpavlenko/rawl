import { AnyEvent } from "./event";
import Stream from "./stream";
export default function deserialize(stream: Stream, lastEventTypeByte: number, setLastEventTypeByte: (eventType: number) => void): AnyEvent;
