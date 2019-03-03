import React from "react"
import { pure } from "recompose"
import f from "helpers/flatJoin"
import coarsify from "helpers/coarsify"

import "./NumberInput.css"

function NumberInput({
  className,
  value,
  onChange,
  placeholder,
  minValue = 0,
  maxValue = 100
}) {
  function addValue(e, value) {
    setValue(e, (parseFloat(e.target.value) || 0) + value)
  }

  function setValue(e, value) {
    e.target.value = coarsify(value, minValue, maxValue)
    onChange(e)
  }

  function handleWheel(e) {
    e.preventDefault()
    const movement = e.deltaY > 0 ? -1 : 1
    addValue(e, movement)
  }

  function handleMouseDown(e) {
    const { target } = e
    const startY = e.clientY
    const startValue = parseFloat(target.value) || 0

    function onMouseMove(e) {
      const delta = e.clientY - startY
      setValue(e, startValue - Math.ceil(delta / 2))
    }

    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  return (
    <input
      type="number"
      className={f("NumberInput", className)}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    />
  )
}

export default pure(NumberInput)
