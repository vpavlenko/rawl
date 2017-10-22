import React from "react"
import { pure } from "recompose"

import f from "helpers/flatJoin"
import e from "helpers/getElementType"

import "./Icon.css"
import "mdi/css/materialdesignicons.css"

function Icon({
  component,
  children,
  className,
  onClick
}) {
  const ElementType = e(component)
  return <ElementType
    className={f("Icon", "mdi", `mdi-${children}`, className)}
    onClick={onClick}
  />
}

export default pure(Icon)
