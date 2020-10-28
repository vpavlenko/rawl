import { Container } from "@inlet/react-pixi"
import Color from "color"
import { useObserver } from "mobx-react-lite"
import React, { FC, useMemo } from "react"
import { filterEventsWithScroll } from "../../../../common/helpers/filterEventsWithScroll"
import { isNoteEvent, NoteEvent } from "../../../../common/track"
import { useMemoObserver } from "../../../hooks/useMemoObserver"
import { useNoteTransform } from "../../../hooks/useNoteTransform"
import { useRecycle } from "../../../hooks/useRecycle"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { PianoNote, PianoNoteItem } from "./PianoNote"

export interface PianoNotesProps {
  trackId: number
  width: number
  isGhost: boolean
}

/**
  ノートイベントを描画するコンポーネント
*/
const PianoNotes: FC<PianoNotesProps> = ({ trackId, width, isGhost }) => {
  const { rootStore } = useStores()

  const { events, isRhythmTrack } = useObserver(() => {
    const track = rootStore.song.tracks[trackId]
    return {
      events: track?.events ?? [],
      isRhythmTrack: track?.isRhythmTrack ?? false,
    }
  })

  const scrollLeft = useMemoObserver(() => rootStore.pianoRollStore.scrollLeft)
  const selection = useObserver(() => rootStore.pianoRollStore.selection)

  const transform = useNoteTransform()
  const theme = useTheme()

  const baseColor = Color(isGhost ? theme.ghostNoteColor : theme.themeColor)
  const color = baseColor.rgbNumber()
  const borderColor = baseColor.lighten(0.3).rgbNumber()
  const selectedColor = baseColor.lighten(0.7).rgbNumber()
  const selectedBorderColor = baseColor.lighten(0.8).rgbNumber()

  const windowNotes = (notes: NoteEvent[]): NoteEvent[] =>
    filterEventsWithScroll(notes, transform.pixelsPerTick, scrollLeft, width)

  const notes = useMemo(
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

  const items = useRecycle(notes).map((item) => (
    <PianoNote
      key={item.key}
      item={item.value}
      color={color}
      borderColor={borderColor}
      selectedColor={selectedColor}
      selectedBorderColor={selectedBorderColor}
    />
  ))

  return <Container>{items}</Container>
}

const areEqual = (props: PianoNotesProps, nextProps: PianoNotesProps) =>
  props.trackId === nextProps.trackId &&
  props.width === nextProps.width &&
  props.isGhost === nextProps.isGhost

export default React.memo(PianoNotes, areEqual)
