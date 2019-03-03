import React, { ReactNode, StatelessComponent } from "react"
import { pure } from "recompose"
import f from "helpers/flatJoin"
import e from "helpers/getElementType"

import "./Button.css"

export interface ButtonProps {
  component?: string
  children?: ReactNode
  onClick?: (any) => void
  className?: string
}

const Button: StatelessComponent<ButtonProps> = ({
  component,
  children,
  onClick,
  className
}) => {
  const ElementType = e(component)
  return (
    <ElementType className={f("Button", className)} onClick={onClick}>
      {children}
    </ElementType>
  )
}

export default pure(Button)
