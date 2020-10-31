import { ClickAwayListener, MenuItem, MenuList, Paper } from "@material-ui/core"
import { ThemeProvider } from "@material-ui/styles"
import React from "react"
import ReactDOM from "react-dom"
import { theme } from "../../../common/theme/muiTheme"
import "./ContextMenu.css"

function renderElement(html: string) {
  const template = document.createElement("template")
  template.innerHTML = html
  return template.content.firstElementChild
}

export interface ContextMenuMouseEvent {
  preventDefault(): void
  pageX: number
  pageY: number
}

export const createContextMenu = (
  childrenProvider: (close: () => void) => JSX.Element[]
) => (e: ContextMenuMouseEvent) => {
  e.preventDefault()

  const elm = renderElement(`<div class="ContextMenu" />`)
  if (elm === null) {
    throw new Error("failed to render elements")
  }

  const body = document.querySelector("body")
  if (body === null) {
    throw new Error("body is undefined")
  }

  body.appendChild(elm)

  const close = () => body.removeChild(elm)

  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <div className="overlay">
        <div style={{ position: "absolute", left: e.pageX, top: e.pageY }}>
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
  e: ContextMenuMouseEvent,
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
    .filter((i) => i.isHidden !== true)
    .map((i, k) => (
      <MenuItem key={k} onClick={i.onClick}>
        {i.label}
      </MenuItem>
    ))
