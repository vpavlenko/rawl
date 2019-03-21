import React from "react"

import "./Header.css"

export interface HeaderProps {
  title: string
  onClickTitle: () => void
  children: JSX.Element[]
}

export default function Header({ title, onClickTitle, children }: HeaderProps) {
  return (
    <div className="Header">
      <span className="title" onClick={onClickTitle}>
        {title}
      </span>
      {children}
    </div>
  )
}
