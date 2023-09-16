import { SetTempoEvent } from "midifile-ts"
import { NoteEvent, TrackEvent, TrackEventOf } from "../../common/track"

export interface PianoNotesClipboardData {
  type: "piano_notes"
  notes: NoteEvent[]
}

export const isPianoNotesClipboardData = (
  x: any,
): x is PianoNotesClipboardData => x.type === "piano_notes" && "notes" in x

export interface ArrangeNotesClipboardData {
  type: "arrange_notes"
  notes: { [key: number]: TrackEvent[] }
  selectedTrackId: number
}

export const isArrangeNotesClipboardData = (
  x: any,
): x is ArrangeNotesClipboardData =>
  x.type === "arrange_notes" && "notes" in x && "selectedTrackId" in x

export interface ControlEventsClipboardData {
  type: "control_events"
  events: TrackEvent[]
}

export const isControlEventsClipboardData = (
  x: any,
): x is ControlEventsClipboardData =>
  x.type === "control_events" && "events" in x

export interface TempoEventsClipboardData {
  type: "tempo_events"
  events: TrackEventOf<SetTempoEvent>[]
}

export const isTempoEventsClipboardData = (
  x: any,
): x is ControlEventsClipboardData => x.type === "tempo_events" && "events" in x
