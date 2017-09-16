import React from "react"

import Icon from "../Icon"

import fitToContainer from "../../hocs/fitToContainer"
import { pointSub } from "../../helpers/point"

import "./ScrollBar.css"

export const BAR_WIDTH = 17
const BUTTON_SIZE = 15
const MIN_THUMB_LENGTH = BAR_WIDTH

const LONG_PRESS_DELAY = 300
const LONG_PRESS_INTERVAL = 50
const LONG_PRESS_SPEED = 0.5
const SCROLL_BASE_AMOUNT = 20

function normalize(v) {
  return Math.max(0, Math.min(1, v))
}

function ScrollBar({
  isVertial,
  barLength,
  scrollOffset = 50,
  contentLength = 1000,
  onScroll
}) {
  const buttonLength = BUTTON_SIZE
  const maxOffset = contentLength - barLength
  const maxLength = barLength - buttonLength * 2
  const valueRatio = normalize(barLength / contentLength)
  const thumbLength = Math.max(MIN_THUMB_LENGTH, maxLength * valueRatio)
  const pageForwardLength = (maxLength - thumbLength) * normalize(scrollOffset / maxOffset)
  const pageBackwardLength = maxLength - thumbLength - pageForwardLength

  const className = isVertial ? "VerticalScrollBar" : "HorizontalScrollBar"
  const lengthProp = isVertial ? "height" : "width"

  const onScroll2 = scroll => {
    onScroll({ scroll: Math.min(maxOffset, Math.max(0, scroll)) })
  }

  const onMouseDown = e => {
    const { className } = e.target
    const startPos = getPoint(e)

    if (className === "thumb") {
      const startValue = scrollOffset

      const onGlobalMouseMove = e => {
        const p = [isVertial ? "y" : "x"]
        const delta = pointSub(getPoint(e), startPos)[p]
        const scale = maxOffset / (maxLength - thumbLength) // 移動量とスクロール量の補正値
        const value = startValue + delta * scale
        onScroll2(value)
      }

      const onGlobalMouseUp = e => {
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
      onScroll2(scroll += delta)

      const isHoverOnTarget = () => {
        return document.elementFromPoint(startPos.x, startPos.y) === currentTarget
      }

      const startLongPressTimer = delta => {
        // 初回は時間をかける
        intervalId = setInterval(() => {
          clearInterval(intervalId)

          if (!isHoverOnTarget()) {
            return
          }

          onScroll2(scroll += delta)

          // 二回目からは素早く繰り返す
          intervalId = setInterval(() => {
            onScroll2(scroll += delta * LONG_PRESS_SPEED)

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

      const onGlobalMouseMove = e => {
        if (currentTarget !== e.target) {
          stopLongPressTimer()
        }
      }

      const onGlobalMouseUp = e => {
        stopLongPressTimer()
        document.removeEventListener("mousemove", onGlobalMouseMove)
        document.removeEventListener("mouseup", onGlobalMouseUp)
      }

      document.addEventListener("mousemove", onGlobalMouseMove)
      document.addEventListener("mouseup", onGlobalMouseUp)
    }
  }

  const triangle = <Icon>triangle</Icon>

  return <div
    className={`ScrollBar ${className}`}
    onMouseDown={onMouseDown}>
    <div className="button-backward" style={{ [lengthProp]: buttonLength }}>{triangle}</div>
    <div className="page-backward" style={{ [lengthProp]: pageForwardLength }} />
    <div className="thumb" style={{ [lengthProp]: thumbLength }} />
    <div className="page-forward" style={{ [lengthProp]: pageBackwardLength }} />
    <div className="button-forward" style={{ [lengthProp]: buttonLength }}>{triangle}</div>
  </div>
}

function scrollAmountOfElement(className, baseValue) {
  switch (className) {
    case "button-backward": return -baseValue
    case "button-forward": return baseValue
    case "page-backward": return -baseValue * 4
    case "page-forward": return baseValue * 4
    default: return 0
  }
}

function getPoint(e) {
  return {
    x: e.pageX,
    y: e.pageY
  }
}

function VerticalScrollBar_(props) {
  return <ScrollBar isVertial={true} {...props} barLength={props.containerHeight} />
}

export function HorizontalScrollBar_(props) {
  return <ScrollBar isVertial={false} {...props} barLength={props.containerWidth} />
}

export const VerticalScrollBar = fitToContainer(VerticalScrollBar_, {
  width: BAR_WIDTH,
  height: "100%",
  position: "absolute",
  top: 0,
  right: 0
})

export const HorizontalScrollBar = fitToContainer(HorizontalScrollBar_, {
  width: "100%",
  height: BAR_WIDTH,
  position: "absolute",
  bottom: 0,
  left: 0
})
