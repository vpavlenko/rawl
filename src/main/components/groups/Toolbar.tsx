import React, { ReactNode, FC } from "react"
import f from "helpers/flatJoin"

import "./Toolbar.css"

export interface ToolbarProps {
  className?: string
}

export const Toolbar: FC<ToolbarProps> = ({ children, className }) => (
  <div className={f("Toolbar", className)}>{children}</div>
)

export interface ToolbarItemProps {
  selected?: boolean
  onClick?: () => void
  touchDisabled?: boolean
  className?: string
}

export const ToolbarItem: FC<ToolbarItemProps> = ({
  children,
  className,
  selected,
  onClick,
  touchDisabled,
}) => (
  <div
    className={f(
      "ToolbarItem",
      className,
      selected ? "selected" : undefined,
      touchDisabled ? "touch-disabled" : undefined
    )}
    onClick={onClick}
  >
    {children}
  </div>
)

export interface ToolbarSeparatorProps {
  className?: string
}

export const ToolbarSeparator: FC<ToolbarSeparatorProps> = ({ className }) => (
  <div className={f("ToolbarSeparator", className)} />
)
