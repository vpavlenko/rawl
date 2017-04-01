import React from "react"
import f from "../../helpers/flatJoin"

import "./TextInput.css"

export default function TextInput({
  className,
  value,
  onChange,
  placeholder
}) {
  return <input
    type="text"
    className={f("TextInput", className)}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
  />
}
