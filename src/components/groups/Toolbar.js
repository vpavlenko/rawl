import React from "react"
import f from "helpers/flatJoin"

import "./Toolbar.css"

export function Toolbar({
  children,
  className
}) {
  return <div
    className={f("Toolbar", className)}>
    {children}
  </div>
}

export function ToolbarItem({
  children,
  className,
  selected,
  onClick,
  touchDisabled
}) {
  return <div
    className={f("ToolbarItem", className, selected && "selected", touchDisabled && "touch-disabled")}
    onClick={onClick}>
    {children}
  </div>
}

export function ToolbarSeparator({
  className
}) {
  return <div
    className={f("ToolbarSeparator", className)} />
}
