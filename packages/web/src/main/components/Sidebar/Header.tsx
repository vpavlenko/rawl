import React, { SFC } from "react"

import "./Header.css"

export interface HeaderProps {
  title: string
  onClickTitle: () => void
}

const Header: SFC<HeaderProps> = ({ title, onClickTitle, children }) => (
  <div className="Header">
    <span className="title" onClick={onClickTitle}>
      {title}
    </span>
    {children}
  </div>
)

export default Header
