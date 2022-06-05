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
  onCut?: (e: ClipboardEvent) => void
  onCopy?: (e: ClipboardEvent) => void
  onPaste?: (e: ClipboardEvent) => void
}

export const KeyboardShortcut: FC<KeyboardShortcutProps> = ({
  actions,
  onCut,
  onCopy,
  onPaste,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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

    window.addEventListener("keydown", onKeyDown)

    document.oncut = onCut ?? null
    document.oncopy = onCopy ?? null
    document.onpaste = onPaste ?? null

    return () => {
      document.removeEventListener("keydown", onKeyDown)

      document.oncut = null
      document.oncopy = null
      document.onpaste = null
    }
  }, [])

  return <></>
}
