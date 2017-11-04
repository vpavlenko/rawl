import React from "react"
import Icon from "components/Icon"

import "./NavigationBar.css"

export default function NavigationBar({
  title,
  children,
  onClickBack
}) {
  return <nav className="NavigationBar">
    <div className="title">
      {onClickBack && <Icon onClick={onClickBack}>chevron-left</Icon>}
      <span>{title}</span>
    </div>
    {children}
  </nav>
}