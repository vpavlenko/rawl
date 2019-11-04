import React from "react"
import { pure } from "recompose"
import f from "helpers/flatJoin"

import "./TextInput.css"

export interface TextInputProps {
  className: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
}

function TextInput({
  className,
  value,
  onChange,
  placeholder
}: TextInputProps) {
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
