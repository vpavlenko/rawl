import React from "react"
import { pure } from "recompose"
import f from "helpers/flatJoin"
import coarsify from "helpers/coarsify"

import "./NumberInput.css"

export interface NumberInputProps {
  className?: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  minValue?: number
  maxValue?: number
}

function NumberInput({
  className = "",
  value,
  onChange,
  placeholder = "",
  minValue = 0,
  maxValue = 100
}: NumberInputProps) {
  function addValue(e: MouseEvent, value: number) {
    setValue(e, (parseFloat((e.target as HTMLInputElement).value) || 0) + value)
  }

  function setValue(e: MouseEvent, value: number) {
    const input = e.target as HTMLInputElement
    const v = coarsify(value, minValue, maxValue)
    input.value = `${v}`
    onChange(v)
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    const movement = e.deltaY > 0 ? -1 : 1
    addValue(e.nativeEvent, movement)
  }

  function handleMouseDown(e: React.MouseEvent<HTMLInputElement>) {
    const startY = e.clientY
    const startValue = parseFloat(e.currentTarget.value) || 0

    function onMouseMove(e: MouseEvent) {
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(parseFloat(e.currentTarget.value))
  }

  return (
    <input
      type="number"
      className={f("NumberInput", className)}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    />
  )
}

export default pure(NumberInput)
