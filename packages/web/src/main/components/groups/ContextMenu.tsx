import React, { StatelessComponent, ReactNode } from "react"
import ReactDOM from "react-dom"

import { IPoint } from "common/geometry"

import "./ContextMenu.css"
import { MenuList, MenuItem, Paper, ClickAwayListener } from "@material-ui/core"
import { ThemeProvider } from "@material-ui/styles"
import { theme } from "helpers/muiTheme"

function renderElement(html: string) {
  const template = document.createElement("template")
  template.innerHTML = html
  return template.content.firstElementChild
}

export const createContextMenu = (
  childrenProvider: (close: () => void) => JSX.Element[]
) => (e: React.MouseEvent) => {
  let position: IPoint
  if (e.preventDefault) {
    e.preventDefault()
  }
  if (e.pageX !== undefined && e.pageY !== undefined) {
    position = {
      x: e.pageX,
      y: e.pageY
    }
  }

  const elm = renderElement(`<div class="ContextMenu" />`)
  document.querySelector("body").appendChild(elm)

  const close = () => elm.parentNode.removeChild(elm)

  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <div className="overlay">
        <div
          style={{ position: "absolute", left: position.x, top: position.y }}
        >
          <Paper>
            <ClickAwayListener onClickAway={close}>
              <MenuList>{childrenProvider(close)}</MenuList>
            </ClickAwayListener>
          </Paper>
        </div>
      </div>
    </ThemeProvider>,
    elm
  )
}

export type ContextMenuBuilder = (close: () => void) => ContextMenuItemContent[]

export function openContextMenu(
  e: React.MouseEvent,
  builder: ContextMenuBuilder
) {
  const contextMenu = (close: () => void) =>
    createContextMenuComponent(builder(close))
  const menuCreator = createContextMenu(contextMenu)
  return menuCreator(e)
}

export interface ContextMenuItemContent {
  isHidden?: boolean
  label: string
  onClick: () => void
}

export const createContextMenuComponent = (items: ContextMenuItemContent[]) =>
  items
    .filter(i => i.isHidden !== true)
    .map((i, k) => (
      <MenuItem key={k} onClick={i.onClick}>
        {i.label}
      </MenuItem>
    ))
