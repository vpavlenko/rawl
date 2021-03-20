import { Container } from "@inlet/react-pixi"
import Color from "color"
import { useObserver } from "mobx-react-lite"
import { DisplayObject, Graphics, Rectangle } from "pixi.js"
import React, { FC, useEffect, useMemo, useRef } from "react"
import { filterEventsWithScroll } from "../../../../common/helpers/filterEventsWithScroll"
import { isNoteEvent, NoteEvent } from "../../../../common/track"
import { useMemoObserver } from "../../../hooks/useMemoObserver"
import { useNoteTransform } from "../../../hooks/useNoteTransform"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { PianoNoteItem, PianoNoteProps, renderPianoNote } from "./PianoNote"

export interface PianoNotesProps {
  trackId: number
  width: number
  isGhost: boolean
}

class NoteGraphics extends Graphics {
  private _item: PianoNoteItem | null

  constructor() {
    super()
    this.interactive = true
    this.name = "PianoNote"
  }

  get item(): PianoNoteItem | null {
    return this._item
  }

  update(props: PianoNoteProps) {
    const { item } = props
    this._item = item
    this.x = Math.round(item.x)
    this.y = Math.round(item.y)
    this.hitArea = item.isDrum
      ? new Rectangle(
          -item.height / 2,
          -item.height / 2,
          item.height,
          item.height
        )
      : new Rectangle(0, 0, item.width, item.height)

    renderPianoNote(this, props)
  }
}

export const isNoteGraphics = (x: DisplayObject | null): x is NoteGraphics =>
  x instanceof NoteGraphics

/**
  ノートイベントを描画するコンポーネント
*/
const PianoNotes: FC<PianoNotesProps> = ({ trackId, width, isGhost }) => {
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

  const ref = useRef<PIXI.Container>(null)

  useEffect(() => {
    const container = ref.current
    if (container === null) {
      return
    }
    let existingNotes = container.children.filter(isNoteGraphics)
    for (let item of notes) {
      const g =
        existingNotes.find((g) => g.item?.id === item.id) ??
        (() => {
          const g = new NoteGraphics()
          container.addChild(g)
          g.update({
            item,
            color,
            borderColor,
            selectedBorderColor,
            selectedColor,
          })
          return g
        })()

      existingNotes = existingNotes.filter((g) => g.item?.id !== item.id)
    }
    for (let g of existingNotes) {
      container.removeChild(g)
    }
  }, [notes])

  return <Container ref={ref}></Container>
}

const areEqual = (props: PianoNotesProps, nextProps: PianoNotesProps) =>
  props.trackId === nextProps.trackId &&
  props.width === nextProps.width &&
  props.isGhost === nextProps.isGhost

export default React.memo(PianoNotes, areEqual)
