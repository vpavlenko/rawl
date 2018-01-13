import React from "react"

import "./Header.css"

export default function Header({ title, onClickTitle }) {
  return <div className="Header">
    <span className="title" onClick={onClickTitle}>{title}</span>
  </div>
}
