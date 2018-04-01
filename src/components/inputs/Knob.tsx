import React, { Component } from "react"
import { pure } from "recompose"
import coarsify from "helpers/coarsify"

import "./Knob.css"

// 最大値になるまでのドラッグ移動量
const MAX_VALUE_MOVE_LENGTH = 150

// ホイール1行分の回転による変化量
const WHEEL_SPEED = 0.1

function Content({
  value = 0,
  onChange = (e: Event) => {},
  offsetDegree = 0,
  maxDegree = 360,
  maxValue = 1,
  minValue = 0,
  dragging = false,
  setDragging = (dragging: boolean) => {}
}) {
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

const Contentp = pure(Content)

export default class Knob extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dragging: false
    }
  }

  render() {
    return <Contentp
      {...this.props}
      {...this.state}
      setDragging={dragging => this.setState({ dragging })}
    />
  }
}
