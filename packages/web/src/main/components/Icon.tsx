import React from "react"
import { pure } from "recompose"

import f from "helpers/flatJoin"
import e from "helpers/getElementType"

import "./Icon.css"
import "@mdi/font/css/materialdesignicons.css"

export interface IconProps {
  component?: JSX.Element
  children: string
  className?: string
  onClick?: (e: any) => void
}

const Icon = ({ component, children, className, onClick }: IconProps) => {
  const ElementType = e(component)
  return (
    <ElementType
      className={f("Icon", "mdi", `mdi-${children}`, className)}
      onClick={onClick}
    />
  )
}

export default pure(Icon)
