import React from "react"

import "./Header.css"

export default function Header({ title, onClickTitle, children }) {
  return (
    <div className="Header">
      <span className="title" onClick={onClickTitle}>
        {title}
      </span>
      {children}
    </div>
  )
}
