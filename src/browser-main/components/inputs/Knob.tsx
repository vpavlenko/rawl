import React, { Component, StatelessComponent } from "react"
import { pure, compose, withState, Omit } from "recompose"
import coarsify from "helpers/coarsify"

import "./Knob.css"

// 最大値になるまでのドラッグ移動量
const MAX_VALUE_MOVE_LENGTH = 150

// ホイール1行分の回転による変化量
const WHEEL_SPEED = 0.1

export interface KnobProps {
  value: number
  onChange: (e: any) => void
  offsetDegree: number
  maxDegree: number
  maxValue: number
  minValue: number
  dragging: boolean
  setDragging: (boolean) => void
}

const Knob: StatelessComponent<KnobProps> = ({
  value = 0,
  onChange = () => {},
  offsetDegree = 0,
  maxDegree = 360,
  maxValue = 1,
  minValue = 0,
  dragging = false,
  setDragging = (dragging: boolean) => {}
}) => {
  const range = maxValue - minValue

  function handleWheel(e) {
    e.preventDefault()
    const movement = e.deltaY > 0 ? -1 : 1
    e.target.value = coarsify(value + movement * WHEEL_SPEED * range, minValue, maxValue)
    onChange(e)
  }

  function handleMouseDown(e) {
    const startY = e.clientY

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    setDragging(true)

    function onMouseMove(e) {
      const delta = e.clientY - startY
      const val = value - delta * range / MAX_VALUE_MOVE_LENGTH
      e.target.value = coarsify(val, minValue, maxValue)
      onChange(e)
    }

    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      setDragging(false)
    }
  }

  return <div
    className={`Knob ${dragging ? "dragging" : ""}`}
    onWheel={handleWheel}
    onMouseDown={handleMouseDown}>
    <div className="body">
      <div className="mark" style={{ transform: `rotate(${value / range * maxDegree + offsetDegree}deg)` }}>
        <div className="dot" />
      </div>
    </div>
    <div className="value">{value}</div>
  </div>
}

export default compose<KnobProps, Omit<KnobProps, "dragging" | "setDragging">>(
  pure,
  withState("dragging", "setDragging", false)
)(Knob)
