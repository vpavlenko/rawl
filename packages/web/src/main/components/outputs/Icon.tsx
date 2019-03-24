import React, { StatelessComponent } from "react"
import { pure } from "recompose"

import f from "helpers/flatJoin"
import e from "helpers/getElementType"

import "./Icon.css"
import "@mdi/font/css/materialdesignicons.css"

export interface IconProps {
  component?: string
  className?: string
  onClick?: () => void
}

const Icon: StatelessComponent<IconProps> = ({
  component,
  children,
  className,
  onClick
}) => {
  const ElementType = e(component)
  return (
    <ElementType
      className={f("Icon", "mdi", `mdi-${children}`, className)}
      onClick={onClick}
    >
      {children}
    </ElementType>
  )
}

export default pure(Icon)
