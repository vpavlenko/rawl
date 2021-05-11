import { last, partition } from "lodash"
import { ControllerEvent } from "midifile-ts"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useEffect, useState } from "react"
import { IPoint, IRect } from "../../../../common/geometry"
import { filterEventsWithScroll } from "../../../../common/helpers/filterEventsWithScroll"
import { TrackEvent, TrackEventOf } from "../../../../common/track"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"
import { GLCanvas } from "../../GLCanvas/GLCanvas"
import { GraphAxis } from "./GraphAxis"
import { LineGraphRenderer } from "./LineGraphRenderer"

interface ItemValue {
  tick: number
  value: number
}

export interface LineGraphControlProps {
  width: number
  height: number
  maxValue: number
  filterEvent: (e: TrackEvent) => boolean
  createEvent: (value: ItemValue) => void
  onClickAxis: (value: number) => void
  lineWidth?: number
  axis: number[]
}

const joinObjects = <T extends {}>(
  list: T[],
  separator: (prev: T, next: T) => T
): T[] => {
  const result = []
  for (let i = 0; i < list.length; i++) {
    result.push(list[i])
    if (i < list.length - 1) {
      result.push(separator(list[i], list[i + 1]))
    }
  }
  return result
}

const LineGraphControl: FC<LineGraphControlProps> = observer(
  ({
    maxValue,
    filterEvent,
    createEvent,
    width,
    height,
    lineWidth = 2,
    axis,
    onClickAxis,
  }) => {
    const theme = useTheme()
    const rootStore = useStores()
    const { mappedBeats, cursorX, scrollLeft, transform } =
      rootStore.pianoRollStore

    const controllerEvents = (
      rootStore.song.selectedTrack?.events ?? []
    ).filter(filterEvent) as TrackEventOf<ControllerEvent>[]

    let events = filterEventsWithScroll(
      controllerEvents,
      transform.pixelsPerTick,
      scrollLeft,
      width
    )

    if (events.length > 0) {
      // add previous event
      const index = controllerEvents.indexOf(events[0])
      if (index > 0) {
        const lastEvent = controllerEvents[index - 1]
        events.unshift(lastEvent)
      }
    } else if (controllerEvents.length > 0) {
      // add last event
      events.push(last(controllerEvents)!)
    }

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
        height: lineWidth,
      }
    })

    const rects = joinObjects<IRect>(items_, (prev, next) => {
      const y = Math.min(prev.y, next.y)
      const height = Math.abs(prev.y - next.y) + lineWidth
      return {
        x: next.x,
        y,
        width: lineWidth,
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
        rects,
        nonHighlightedBeats.map((b) => b.x),
        highlightedBeats.map((b) => b.x),
        [],
        cursorX,
        scrollLeft
      )
    }, [renderer, scrollLeft, mappedBeats, cursorX, rects])

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
)

export default React.memo(LineGraphControl)
