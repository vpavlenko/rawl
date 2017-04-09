import React, { Component } from "react"
import ReactDOM from "react-dom"

import styles from "./ContextMenu.css"

const Nop = () => {}

function renderElement(html) {
  const template = document.createElement("template")
  template.innerHTML = html
  return template.content.firstElementChild
}

export const createContextMenu = (childrenProvider) => e => {
  e.preventDefault()

  const elm = renderElement(`<div />`)
  document.querySelector("body").appendChild(elm)

  const close = () => elm.parentNode.removeChild(elm)

  ReactDOM.render(<ContextMenuOverlay
    position={{x: e.pageX, y: e.pageY}}
    close={close}>
    {childrenProvider(close)}
  </ContextMenuOverlay>, elm)
}

export function ContextMenuOverlay({ children, position, close }) {
  return <div className={styles.overlay} onMouseDown={close}>
    <div style={{position: "absolute", left: position.x, top: position.y}}>
      {children}
    </div>
  </div>
}

export function ContextMenu({ children }) {
  return <div className={styles.menu}>{children}</div>
}

export function MenuItem({ children, onClick = Nop, onMouseDown = Nop }) {
  function _onClick(e) {
    e.stopPropagation()
    onClick(e)
  }
  function _onMouseDown(e) {
    e.stopPropagation()
    onMouseDown(e)
  }
  return <div className={styles.item} onClick={_onClick} onMouseDown={_onMouseDown}>{children}</div>
}
