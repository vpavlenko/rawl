import React from "react"

import "./MenuBar.css"

export function MenuBar({ children }) {
  return <div className="menu-bar">
    {children}
  </div>
}

export function MenuItem({ title, children, onClick }) {
  return <div className="item" onClick={onClick}>
    <div className="title">{title}</div>
    {children}
  </div>
}

export function SubMenu({ children }) {
  return <div className="submenu">
    {children}
  </div>
}
