import React, { Component } from "react"
import { pure } from "recompose"
import coarsify from "helpers/coarsify"

import "./Slider.css"

function Content({
  value = 0,
  maxValue = 1,
  onChange = (e: Event) => { },
  dragging = false,
  setDragging = (dragging: boolean) => { }
}) {
  let rect

  function calcValue(e) {
    const localX = e.clientX - rect.left
    const val = localX / rect.width * maxValue
    return coarsify(val, 0, maxValue) // 100 段階になるように精度を落とす
  }

  function onMouseDown(e) {
    rect = e.currentTarget.getBoundingClientRect()
    e.target.value = calcValue(e)
    onChange(e)

    // ドキュメント全体のイベントを取る
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    setDragging(true)

    function onMouseMove(e) {
      e.target.value = calcValue(e)
      onChange(e)
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      setDragging(false)
    }
  }

  function p(v) {
    return `${v * 100}%`
  }

  const handleWidth = "1em"
  return <div
    className={`Slider ${dragging ? "dragging" : ""}`}
    onMouseDown={onMouseDown}>
    <div className="guide-left" style={{
      width: p(value / maxValue)
    }} />
    <div className="guide-right" style={{
      left: p(value / maxValue),
      width: p(1 - value / maxValue)
    }} />
    <div className="handle" style={{
      left: `calc((100% - ${handleWidth}) * ${value / maxValue})`
    }} />
    <div className="value">{value}</div>
  </div>
}

const Contentp = pure(Content)

export default class Slider extends Component {
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
