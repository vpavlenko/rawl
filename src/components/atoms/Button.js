import React from "react"
import f from "../../helpers/flatJoin"
import e from "../../helpers/getElementType"

import "./Button.css"

export default function Button({
  component,
  children,
  onClick,
  className
}) {
  const ElementType = e(component)
  return <ElementType
    className={f("Button", className)}
    onClick={onClick}>
    {children}
  </ElementType>
}
