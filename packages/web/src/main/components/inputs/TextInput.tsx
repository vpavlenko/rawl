import React from "react"
import { pure } from "recompose"
import f from "helpers/flatJoin"

import "./TextInput.css"

function TextInput({ className, value, onChange, placeholder }) {
  return (
    <input
      type="text"
      className={f("TextInput", className)}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  )
}

export default pure(TextInput)
