import React from "react"
import f from "../../helpers/flatJoin"

import "./NumberInput.css"

export default function NumberInput({ className, value, onChange, placeholder }) {
  function handleWheel(e) {
    e.preventDefault()
    const movement = e.deltaY > 0 ? -1 : 1
    e.target.value = (parseFloat(e.target.value) || 0) + movement
    onChange(e)
  }

  return <input 
    type="number"
    className={f("NumberInput", className)} 
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    onWheel={handleWheel}
  />
}
