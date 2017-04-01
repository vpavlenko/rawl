import React from "react"
import f from "../../helpers/flatJoin"

import "./NumberInput.css"

export default function NumberInput({
  className,
  value,
  onChange,
  placeholder
}) {
  function addValue(target, value) {
    target.value = (parseFloat(target.value) || 0) + value
    onChange(target)
  }

  function setValue(target, value) {
    target.value = value
    onChange(target)
  }

  function handleWheel(e) {
    e.preventDefault()
    const movement = e.deltaY > 0 ? -1 : 1
    addValue(e.target, movement)
  }

  function handleMouseDown(e) {
    const { target } = e
    const startY = e.clientY
    const startValue = parseFloat(target.value) || 0

    function onMouseMove(e) {
      const delta = e.clientY - startY
      setValue(target, startValue - Math.ceil(delta / 2))
    }

    function onMouseUp(e) {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  return <input
    type="number"
    className={f("NumberInput", className)}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    onWheel={handleWheel}
    onMouseDown={handleMouseDown}
  />
}
