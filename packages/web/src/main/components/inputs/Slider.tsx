import React, { StatelessComponent } from "react"
import { pure, compose, withState, Omit } from "recompose"
import coarsify from "helpers/coarsify"

import "./Slider.css"

export interface SliderProps {
  value: number
  maxValue: number
  onChange: (value: number) => void
  dragging: boolean
  setDragging: (dragging: boolean) => void
}

const Slider: StatelessComponent<SliderProps> = ({
  value = 0,
  maxValue = 1,
  onChange = () => {},
  dragging = false,
  setDragging = () => {}
}) => {
  let rect: ClientRect

  function calcValue(e: React.MouseEvent | MouseEvent) {
    const localX = e.clientX - rect.left
    const val = (localX / rect.width) * maxValue
    return coarsify(val, 0, maxValue) // 100 段階になるように精度を落とす
  }

  function onMouseDown(e: React.MouseEvent) {
    rect = e.currentTarget.getBoundingClientRect()
    onChange(calcValue(e))

    // ドキュメント全体のイベントを取る
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    setDragging(true)

    function onMouseMove(e: MouseEvent) {
      onChange(calcValue(e))
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      setDragging(false)
    }
  }

  function p(v: number) {
    return `${v * 100}%`
  }

  const handleWidth = "1em"
  return (
    <div
      className={`Slider ${dragging ? "dragging" : ""}`}
      onMouseDown={onMouseDown}
    >
      <div
        className="guide-left"
        style={{
          width: p(value / maxValue)
        }}
      />
      <div
        className="guide-right"
        style={{
          left: p(value / maxValue),
          width: p(1 - value / maxValue)
        }}
      />
      <div
        className="handle"
        style={{
          left: `calc((100% - ${handleWidth}) * ${value / maxValue})`
        }}
      />
      <div className="value">{value}</div>
    </div>
  )
}

export default compose<
  SliderProps,
  Omit<SliderProps, "dragging" | "setDragging">
>(
  withState("dragging", "setDragging", false),
  pure
)(Slider)
