import { partition } from "lodash"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { containsPoint, IPoint, IRect } from "../../../../common/geometry"
import { isNoteEvent } from "../../../../common/track"
import { changeNotesVelocity } from "../../../actions"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { GLCanvas } from "../../GLCanvas/GLCanvas"
import { observeDrag } from "../../PianoRoll/MouseHandler/observeDrag"
import { GraphAxis } from "../Graph/GraphAxis"
import { VelocityControlRenderer } from "./VelocityControlRenderer"

export interface PianoVelocityControlProps {
  width: number
  height: number
}

const Parent = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
`

const hitTest = <T extends { hitArea: IRect }>(items: T[], point: IPoint) => {
  return items.filter((n) => containsPoint(n.hitArea, point))
}

const PianoVelocityControl: FC<PianoVelocityControlProps> = observer(
  ({ width, height }: PianoVelocityControlProps) => {
    const theme = useTheme()
    const rootStore = useStores()
    const { mappedBeats, cursorX, transform, scrollLeft, windowedEvents } =
      rootStore.pianoRollStore
    const changeVelocity = useCallback(changeNotesVelocity(rootStore), [])

    const items = windowedEvents.filter(isNoteEvent).map((note) => {
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
        const hitItems = hitTest(items, local)

        if (hitItems.length === 0) {
          return
        }

        const startY = e.clientY - e.offsetY

        const calcValue = (e: MouseEvent) => {
          const offsetY = e.clientY - startY
          return Math.round(
            Math.max(0, Math.min(1, 1 - offsetY / height)) * 127
          )
        }

        const noteIds = hitItems.map((e) => e.id)

        changeVelocity(noteIds, calcValue(e))

        observeDrag({
          onMouseMove: (e) => changeVelocity(noteIds, calcValue(e)),
        })
      },
      [height, items]
    )

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
        <GraphAxis values={[0, 32, 64, 96, 128]} onClick={() => {}} />
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
  return props.width === nextProps.width && props.height === nextProps.height
}

export default React.memo(PianoVelocityControl, areEqual)
