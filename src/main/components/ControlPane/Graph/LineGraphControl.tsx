import { partition } from "lodash"
import React, { FC, useCallback, useEffect, useState } from "react"
import { IPoint } from "../../../../common/geometry"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { GLCanvas } from "../../GLCanvas/GLCanvas"
import { GraphAxis } from "./GraphAxis"
import { LineGraphRenderer } from "./LineGraphRenderer"

interface ItemValue {
  tick: number
  value: number
}

export interface LineGraphControlEvent extends ItemValue {
  id: number
}

export interface LineGraphControlProps {
  width: number
  height: number
  events: LineGraphControlEvent[]
  maxValue: number
  createEvent: (value: ItemValue) => void
  onClickAxis: (value: number) => void
  lineWidth?: number
  axis: number[]
}

const LineGraphControl: FC<LineGraphControlProps> = ({
  events,
  maxValue,
  createEvent,
  width,
  height,
  lineWidth = 1,
  axis,
  onClickAxis,
}) => {
  const theme = useTheme()
  const { pianoRollStore } = useStores()
  const { mappedBeats, cursorX, scrollLeft, transform } = pianoRollStore

  function transformToPosition(tick: number, value: number) {
    return {
      x: Math.round(transform.getX(tick)),
      y:
        Math.round((1 - value / maxValue) * (height - lineWidth * 2)) +
        lineWidth,
    }
  }

  function transformFromPosition(position: IPoint): ItemValue {
    return {
      tick: transform.getTicks(position.x),
      value:
        (1 - (position.y - lineWidth) / (height - lineWidth * 2)) * maxValue,
    }
  }

  const onMouseDown = (ev: React.MouseEvent) => {
    const e = ev.nativeEvent
    const local = {
      x: e.offsetX + scrollLeft,
      y: e.offsetY,
    }
    createEvent(transformFromPosition(local))
  }

  const items = events.map((e) => {
    return {
      id: e.id,
      ...transformToPosition(e.tick, e.value),
    }
  })

  const right = scrollLeft + width
  const items_ = items.map(({ id, x, y }, i) => {
    const next = items[i + 1]
    const nextX = next ? next.x : right // 次がなければ右端まで描画する
    return {
      id,
      x,
      y,
      width: nextX - x,
      height,
    }
  })

  const [renderer, setRenderer] = useState<LineGraphRenderer | null>(null)

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
      items_,
      nonHighlightedBeats.map((b) => b.x),
      highlightedBeats.map((b) => b.x),
      [],
      cursorX,
      scrollLeft
    )
  }, [renderer, scrollLeft, mappedBeats, cursorX, items_])

  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <GraphAxis axis={axis} onClick={onClickAxis} />
      <GLCanvas
        onMouseDown={onMouseDown}
        onCreateContext={useCallback(
          (gl) => setRenderer(new LineGraphRenderer(gl)),
          []
        )}
        width={width}
        height={height}
      />
    </div>
  )
}

export default React.memo(LineGraphControl)
