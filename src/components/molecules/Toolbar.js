import React, { Component } from "react"
import f from "../../helpers/flatJoin"
import e from "../../helpers/getElementType"

import "./Toolbar.css"

export function Toolbar({ component, children, className }) {
  return <div
    className={f("Toolbar", className)}>
    {children}
  </div>
}

export function ToolbarItem({ component, children, className, selected }) {
  return <div
    className={f("ToolbarItem", className, selected && "selected")}>
    {children}
  </div>
}

export function ToolbarSeparator({ component, className }) {
  return <div
    className={f("ToolbarSeparator", className)} />
}
