import React, { Component } from "react"

import "./Slider.css"

export default function Slider({ value, onChange }) {
  let rect
  function calcValue(e) {
    const localX = e.clientX - rect.left
    const val = localX / rect.width
    return Math.min(1, Math.max(0, Math.round(val * 100) / 100)) // 100 段階になるように精度を落とす
  }
  function onMouseDown(e) {
    rect = e.currentTarget.getBoundingClientRect()
    e.target.value = calcValue(e)
    console.log("down", calcValue(e))
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    onChange(e)
  }
  // ドキュメント全体のイベントを取る
  function onMouseMove(e) {
    e.target.value = calcValue(e)
    console.log("move", calcValue(e))
    onChange(e)
  }
  function onMouseUp(e) {
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", onMouseUp)
  }
  function p(v) {
    return `${v * 100}%`
  }
  const handleWidth = "1em"
  return <div className="Slider"
    onMouseDown={onMouseDown}>
    <div className="guide-left" style={{ width: p(value) }}/>
    <div className="guide-right" style={{ left: p(value), width: p(1 - value) }}/>
    <div className="handle" style={{ left: `calc((100% - ${handleWidth}) * ${value})` }}/>
  </div>
}
