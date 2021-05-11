import { partition } from "lodash"
import isEqual from "lodash/isEqual"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { containsPoint, IPoint, IRect } from "../../../../common/geometry"
import { isNoteEvent, TrackEvent } from "../../../../common/track"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { GLCanvas } from "../../GLCanvas/GLCanvas"
import { observeDrag } from "../../PianoRoll/MouseHandler/observeDrag"
import { GraphAxis } from "../Graph/GraphAxis"
import { VelocityControlRenderer } from "./VelocityControlRenderer"

export interface PianoVelocityControlProps {
  width: number
  height: number
  events: TrackEvent[]
  scrollLeft: number
  changeVelocity: (noteIds: number[], velocity: number) => void
}

const Parent = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
`

const hitTest = <T extends { hitArea: IRect }>(items: T[], point: IPoint) => {
  return items.find((n) => containsPoint(n.hitArea, point)) ?? null
}

const PianoVelocityControl: FC<PianoVelocityControlProps> = observer(
  ({
    width,
    height,
    events,
    scrollLeft,
    changeVelocity,
  }: PianoVelocityControlProps) => {
    const theme = useTheme()
    const { pianoRollStore } = useStores()
    const { mappedBeats, cursorX, transform } = pianoRollStore

    const items = events.filter(isNoteEvent).map((note) => {
      const { x } = transform.getRect(note)
      const itemWidth = 5
      const itemHeight = (note.velocity / 127) * height
      return {
        id: note.id,
        x,
        y: height - itemHeight,
        width: itemWidth,
        height: itemHeight,
        hitArea: {
          x,
          y: 0,
          width: itemWidth,
          height,
        },
      }
    })

    const onMouseDown = useCallback(
      (ev: React.MouseEvent) => {
        const e = ev.nativeEvent
        const local = {
          x: e.offsetX + scrollLeft,
          y: e.offsetY,
        }
        const item = hitTest(items, local)

        if (item === null) {
          return
        }

        const startY = e.clientY - e.offsetY

        const calcValue = (e: MouseEvent) => {
          const offsetY = e.clientY - startY
          return Math.round(
            Math.max(0, Math.min(1, 1 - offsetY / height)) * 127
          )
        }

        const noteIds = [item.id]

        changeVelocity(noteIds, calcValue(e))

        observeDrag({
          onMouseMove: (e) => changeVelocity(noteIds, calcValue(e)),
        })
      },
      [height, items]
    )

    const axis = [0, 32, 64, 96, 128]

    const [renderer, setRenderer] = useState<VelocityControlRenderer | null>(
      null
    )

    useEffect(() => {
      if (renderer === null) {
        return
      }

      const [highlightedBeats, nonHighlightedBeats] = partition(
        mappedBeats,
        (b) => b.beat === 0
      )

      renderer.theme = theme
      renderer.render(
        items,
        nonHighlightedBeats.map((b) => b.x),
        highlightedBeats.map((b) => b.x),
        [],
        cursorX,
        scrollLeft
      )
    }, [renderer, scrollLeft, mappedBeats, cursorX, items])

    return (
      <Parent>
        <GraphAxis axis={axis} onClick={() => {}} />
        <GLCanvas
          onMouseDown={onMouseDown}
          onCreateContext={useCallback(
            (gl) => setRenderer(new VelocityControlRenderer(gl)),
            []
          )}
          width={width}
          height={height}
        />
      </Parent>
    )
  }
)

function areEqual(
  props: PianoVelocityControlProps,
  nextProps: PianoVelocityControlProps
) {
  return (
    props.scrollLeft === nextProps.scrollLeft &&
    props.width === nextProps.width &&
    props.height === nextProps.height &&
    props.changeVelocity === nextProps.changeVelocity &&
    isEqual(props.events, nextProps.events)
  )
}

export default React.memo(PianoVelocityControl, areEqual)
