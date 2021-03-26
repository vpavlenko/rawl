import { useObserver } from "mobx-react-lite"
import { useMemo } from "react"
import { IRect } from "../../common/geometry/Rect"
import { filterEventsWithScroll } from "../../common/helpers/filterEventsWithScroll"
import { isNoteEvent, NoteEvent } from "../../common/track"
import { useMemoObserver } from "./useMemoObserver"
import { useNoteTransform } from "./useNoteTransform"
import { useStores } from "./useStores"

export type PianoNoteItem = IRect & {
  id: number
  velocity: number
  isSelected: boolean
  isDrum: boolean
}

export const useNotes = (trackId: number, width: number, isGhost: boolean) => {
  const rootStore = useStores()

  const { events, isRhythmTrack } = useObserver(() => {
    const track = rootStore.song.tracks[trackId]
    return {
      events: [...(track?.events ?? [])], // create new object to fire useMemo update
      isRhythmTrack: track?.isRhythmTrack ?? false,
    }
  })

  const scrollLeft = useMemoObserver(() => rootStore.pianoRollStore.scrollLeft)
  const selection = useObserver(() => rootStore.pianoRollStore.selection)

  const transform = useNoteTransform()

  const windowNotes = (notes: NoteEvent[]): NoteEvent[] =>
    filterEventsWithScroll(notes, transform.pixelsPerTick, scrollLeft, width)

  return useMemo(
    () =>
      windowNotes(events.filter(isNoteEvent)).map(
        (e): PianoNoteItem => {
          const rect = transform.getRect(e)
          const isSelected = !isGhost && selection.noteIds.includes(e.id)
          return {
            ...rect,
            id: e.id,
            velocity: isGhost ? 127 : e.velocity, // draw opaque when ghost
            isSelected,
            isDrum: isRhythmTrack,
          }
        }
      ),
    [events, transform, scrollLeft, width, selection, isGhost, isRhythmTrack]
  )
}
