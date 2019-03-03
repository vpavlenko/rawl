import React, { StatelessComponent, ReactNode } from "react"
import ReactDOM from "react-dom"

import { IPoint } from "common/geometry"

import styles from "./ContextMenu.css"

function renderElement(html: string) {
  const template = document.createElement("template")
  template.innerHTML = html
  return template.content.firstElementChild
}

export const createContextMenu = childrenProvider => e => {
  let position = e
  if (e.preventDefault) {
    e.preventDefault()
  }
  if (e.pageX !== undefined && e.pageY !== undefined) {
    position = {
      x: e.pageX,
      y: e.pageY
    }
  }

  const elm = renderElement(`<div />`)
  document.querySelector("body").appendChild(elm)

  const close = () => elm.parentNode.removeChild(elm)

  ReactDOM.render(
    <ContextMenuOverlay position={position} close={close}>
      {childrenProvider(close)}
    </ContextMenuOverlay>,
    elm
  )
}

export interface ContextMenuOverlayProps {
  children?: ReactNode
  position: IPoint
  close: () => void
}

export const ContextMenuOverlay: StatelessComponent<
  ContextMenuOverlayProps
> = ({ children, position, close }) => {
  return (
    <div
      className={styles.overlay}
      onMouseDown={close}
      onContextMenu={e => e.preventDefault()}
    >
      <div style={{ position: "absolute", left: position.x, top: position.y }}>
        {children}
      </div>
    </div>
  )
}

export interface ContextMenuProps {
  children?: ReactNode
}

export const ContextMenu: StatelessComponent<ContextMenuProps> = ({
  children
}) => {
  return (
    <div className={styles.menu} onContextMenu={e => e.preventDefault()}>
      {children}
    </div>
  )
}

export interface MenuItemProps {
  children?: ReactNode
  onClick: (e: any) => void
  onMouseDown?: (e: any) => void
}

export const MenuItem: StatelessComponent<MenuItemProps> = ({
  children,
  onClick,
  onMouseDown
}) => {
  function _onClick(e) {
    e.stopPropagation()
    onClick(e)
  }
  function _onMouseDown(e) {
    e.stopPropagation()
    onMouseDown(e)
  }
  return (
    <div
      className={styles.item}
      onClick={onClick && _onClick}
      onMouseDown={onMouseDown && _onMouseDown}
      onContextMenu={e => e.preventDefault()}
    >
      {children}
    </div>
  )
}
