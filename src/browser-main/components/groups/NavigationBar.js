import React from "react"
import Icon from "components/Icon.tsx"
import f from "helpers/flatJoin"

import "./NavigationBar.css"

export default function NavigationBar({
  title,
  children,
  className,
  onClickBack
}) {
  return <nav className={f("NavigationBar", className)}>
    <div className="title">
      {onClickBack && <Icon onClick={onClickBack}>chevron-left</Icon>}
      <span>{title}</span>
    </div>
    {children}
  </nav>
}