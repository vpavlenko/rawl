import React, { ReactNode } from "react"
import f from "helpers/flatJoin"

import "./Toolbar.css"

export interface ToolbarProps {
  children?: ReactNode
  className?: string
}

export function Toolbar({ children, className }: ToolbarProps) {
  return <div className={f("Toolbar", className)}>{children}</div>
}

export interface ToolbarItemProps {
  children?: ReactNode
  selected?: boolean
  onClick?: (e: any) => void
  touchDisabled?: boolean
  className?: string
}

export function ToolbarItem({
  children,
  className,
  selected,
  onClick,
  touchDisabled
}: ToolbarItemProps) {
  return (
    <div
      className={f(
        "ToolbarItem",
        className,
        selected && "selected",
        touchDisabled && "touch-disabled"
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export interface ToolbarSeparatorProps {
  className?: string
}

export function ToolbarSeparator({ className }: ToolbarSeparatorProps) {
  return <div className={f("ToolbarSeparator", className)} />
}
