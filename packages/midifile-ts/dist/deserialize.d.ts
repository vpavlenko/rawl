import { Event } from "./event";
export default function deserialize(stream: any, lastEventTypeByte: number, setLastEventTypeByte: (number) => void): Event;
