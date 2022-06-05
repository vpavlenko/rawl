import { FC, useEffect } from "react"
import { isFocusable } from "./isFocusable"

export interface Action {
  code: KeyboardEvent["code"]
  metaKey?: boolean
  shiftKey?: boolean
  run: () => void
}

export interface KeyboardShortcutProps {
  actions: Action[]
}

export const KeyboardShortcut: FC<KeyboardShortcutProps> = ({ actions }) => {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.target !== null && isFocusable(e.target)) {
        return
      }
      const action = actions.find(
        (action) =>
          e.code === action.code &&
          e.shiftKey === (action.shiftKey ?? false) &&
          (e.ctrlKey || e.metaKey) === (action.metaKey ?? false)
      )
      if (action !== undefined) {
        action.run()
        e.preventDefault()
      }
    }

    window.addEventListener("keydown", listener)
  }, [])

  return <></>
}
