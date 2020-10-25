import { ArrowDropUp } from "@material-ui/icons"
import useComponentSize from "@rehooks/component-size"
import { IPoint, pointSub } from "common/geometry"
import React, { FC, useRef } from "react"
import { observeDrag } from "../PianoRoll/MouseHandler/observeDrag"
import "./ScrollBar.css"

export const BAR_WIDTH = 17
const BUTTON_SIZE = 15
const MIN_THUMB_LENGTH = BAR_WIDTH

const LONG_PRESS_DELAY = 300
const LONG_PRESS_INTERVAL = 50
const LONG_PRESS_SPEED = 0.5
const SCROLL_BASE_AMOUNT = 20

function normalize(v: number): number {
  return Math.max(0, Math.min(1, v))
}

const vStyle: React.CSSProperties = {
  width: BAR_WIDTH,
  height: "100%",
  position: "absolute",
  top: 0,
  right: 0,
}

const hStyle: React.CSSProperties = {
  width: "100%",
  height: BAR_WIDTH,
  position: "absolute",
  bottom: 0,
  left: 0,
}

export interface ScrollBarProps {
  children?: React.ReactNode
  isVertical: boolean
  barLength: number
  scrollOffset?: number
  contentLength?: number
  onScroll?: (scroll: number) => void
}

const _ScrollBar: React.RefForwardingComponent<
  HTMLDivElement,
  ScrollBarProps
> = (
  {
    isVertical,
    barLength,
    scrollOffset = 50,
    contentLength = 1000,
    onScroll,
    children,
  },
  ref
) => {
  const buttonLength = BUTTON_SIZE
  const maxOffset = contentLength - barLength
  const maxLength = barLength - buttonLength * 2
  const valueRatio = normalize(barLength / contentLength)
  const thumbLength = Math.max(MIN_THUMB_LENGTH, maxLength * valueRatio)
  const disabled = maxOffset <= 0
  const style = isVertical ? vStyle : hStyle

  let pageForwardLength: number
  let pageBackwardLength: number

  if (disabled) {
    pageForwardLength = 0
    pageBackwardLength = maxLength
  } else {
    pageForwardLength =
      (maxLength - thumbLength) * normalize(scrollOffset / maxOffset)
    pageBackwardLength = maxLength - thumbLength - pageForwardLength
  }

  const className = isVertical ? "VerticalScrollBar" : "HorizontalScrollBar"
  const lengthProp = isVertical ? "height" : "width"

  const onScroll2 = (scroll: number) =>
    onScroll?.(Math.min(maxOffset, Math.max(0, scroll)))

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()

    if (disabled) {
      return
    }

    const { className } = e.target as HTMLDivElement
    const startPos = getPoint(e)

    if (className === "thumb") {
      const startValue = scrollOffset

      observeDrag({
        onMouseMove: (e) => {
          const p = isVertical ? "y" : "x"
          const delta = pointSub(getPoint(e), startPos)[p]
          const scale = maxOffset / (maxLength - thumbLength) // 移動量とスクロール量の補正値
          const value = startValue + delta * scale
          onScroll2(value)
        },
      })
    } else {
      const currentTarget = e.target
      const delta = scrollAmountOfElement(className, SCROLL_BASE_AMOUNT)

      let intervalId = 0
      let scroll = scrollOffset
      onScroll2((scroll += delta))

      const isHoverOnTarget = () =>
        document.elementFromPoint(startPos.x, startPos.y) === currentTarget

      const startLongPressTimer = (delta: number) => {
        // 初回は時間をかける
        intervalId = window.setInterval(() => {
          clearInterval(intervalId)

          if (!isHoverOnTarget()) {
            return
          }

          onScroll2((scroll += delta))

          // 二回目からは素早く繰り返す
          intervalId = window.setInterval(() => {
            onScroll2((scroll += delta * LONG_PRESS_SPEED))

            if (!isHoverOnTarget()) {
              stopLongPressTimer()
            }
          }, LONG_PRESS_INTERVAL)
        }, LONG_PRESS_DELAY)
      }

      const stopLongPressTimer = () => {
        clearInterval(intervalId)
        intervalId = 0
      }

      startLongPressTimer(delta)

      observeDrag({
        onMouseMove: (e) => {
          if (currentTarget !== e.target) {
            stopLongPressTimer()
          }
        },
        onMouseUp: () => {
          stopLongPressTimer()
        },
      })
    }
  }

  const triangle = <ArrowDropUp className="triangle" />

  return (
    <div
      ref={ref}
      style={style}
      className={`ScrollBar ${className}`}
      onMouseDown={onMouseDown}
    >
      <div className="button-backward" style={{ [lengthProp]: buttonLength }}>
        {triangle}
      </div>
      <div
        className="page-backward"
        style={{ [lengthProp]: pageForwardLength }}
      />
      {!disabled && (
        <div className="thumb" style={{ [lengthProp]: thumbLength }} />
      )}
      <div
        className="page-forward"
        style={{ [lengthProp]: pageBackwardLength }}
      />
      <div className="button-forward" style={{ [lengthProp]: buttonLength }}>
        {triangle}
      </div>
      {children}
    </div>
  )
}

export const ScrollBar = React.forwardRef(_ScrollBar)

function scrollAmountOfElement(className: string, baseValue: number) {
  switch (className) {
    case "button-backward":
      return -baseValue
    case "button-forward":
      return baseValue
    case "page-backward":
      return -baseValue * 4
    case "page-forward":
      return baseValue * 4
    default:
      return 0
  }
}

function getPoint(e: MouseEvent | React.MouseEvent): IPoint {
  return {
    x: e.pageX,
    y: e.pageY,
  }
}

type VerticalScrollBar_Props = Omit<ScrollBarProps, "isVertical" | "barLength">
type HorizontalScrollBar_Props = VerticalScrollBar_Props

const VerticalScrollBar_: FC<VerticalScrollBar_Props> = (props) => {
  const ref = useRef<HTMLDivElement>(null)
  const size = useComponentSize(ref)
  return (
    <ScrollBar ref={ref} isVertical={true} {...props} barLength={size.height} />
  )
}

const HorizontalScrollBar_: FC<HorizontalScrollBar_Props> = (props) => {
  const ref = useRef<HTMLDivElement>(null)
  const size = useComponentSize(ref)
  return (
    <ScrollBar ref={ref} isVertical={false} {...props} barLength={size.width} />
  )
}

export type VerticalScrollBarProps = Omit<VerticalScrollBar_Props, "size">
export type HorizontalScrollBarProps = Omit<HorizontalScrollBar_Props, "size">

const areEqual = (
  props: VerticalScrollBar_Props,
  nextProps: VerticalScrollBar_Props
) =>
  props.scrollOffset === nextProps.scrollOffset &&
  props.contentLength === nextProps.contentLength &&
  props.onScroll === nextProps.onScroll

export const VerticalScrollBar = React.memo(VerticalScrollBar_, areEqual)
export const HorizontalScrollBar = React.memo(HorizontalScrollBar_, areEqual)
