import React, { FC } from "react"
import { withSize } from "react-sizeme"

import Icon from "components/outputs/Icon"
import { pointSub, IPoint, ISize } from "common/geometry"

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
  isVertical: boolean
  barLength: number
  scrollOffset?: number
  contentLength?: number
  onScroll?: (scroll: number) => void
}

export const ScrollBar: FC<ScrollBarProps> = ({
  isVertical,
  barLength,
  scrollOffset = 50,
  contentLength = 1000,
  onScroll,
  children,
}) => {
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

      const onGlobalMouseMove = (e: MouseEvent) => {
        const p = isVertical ? "y" : "x"
        const delta = pointSub(getPoint(e), startPos)[p]
        const scale = maxOffset / (maxLength - thumbLength) // 移動量とスクロール量の補正値
        const value = startValue + delta * scale
        onScroll2(value)
      }

      const onGlobalMouseUp = () => {
        document.removeEventListener("mousemove", onGlobalMouseMove)
        document.removeEventListener("mouseup", onGlobalMouseUp)
      }

      document.addEventListener("mousemove", onGlobalMouseMove)
      document.addEventListener("mouseup", onGlobalMouseUp)
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

      const onGlobalMouseMove = (e: MouseEvent) => {
        if (currentTarget !== e.target) {
          stopLongPressTimer()
        }
      }

      const onGlobalMouseUp = (e: MouseEvent) => {
        stopLongPressTimer()
        document.removeEventListener("mousemove", onGlobalMouseMove)
        document.removeEventListener("mouseup", onGlobalMouseUp)
      }

      document.addEventListener("mousemove", onGlobalMouseMove)
      document.addEventListener("mouseup", onGlobalMouseUp)
    }
  }

  const triangle = <Icon>triangle</Icon>

  return (
    <div
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

type VerticalScrollBar_Props = Omit<
  ScrollBarProps,
  "isVertical" | "barLength"
> & { size: ISize }
type HorizontalScrollBar_Props = VerticalScrollBar_Props

const VerticalScrollBar_: FC<VerticalScrollBar_Props> = (props) => (
  <ScrollBar isVertical={true} {...props} barLength={props.size.height} />
)

const HorizontalScrollBar_: FC<HorizontalScrollBar_Props> = (props) => (
  <ScrollBar isVertical={false} {...props} barLength={props.size.width} />
)

export type VerticalScrollBarProps = Omit<VerticalScrollBar_Props, "size">
export type HorizontalScrollBarProps = Omit<HorizontalScrollBar_Props, "size">

const areEqual = (
  props: VerticalScrollBar_Props,
  nextProps: VerticalScrollBar_Props
) =>
  props.scrollOffset === nextProps.scrollOffset &&
  props.contentLength === nextProps.contentLength &&
  props.onScroll === nextProps.onScroll &&
  props.size.width == nextProps.size.width &&
  props.size.height == nextProps.size.height

export const VerticalScrollBar = withSize({
  monitorHeight: true,
  monitorPosition: false,
})(React.memo(VerticalScrollBar_, areEqual))

export const HorizontalScrollBar = withSize({
  monitorHeight: false,
  monitorWidth: true,
  monitorPosition: false,
})(React.memo(HorizontalScrollBar_, areEqual))
