import { FC, useEffect } from "react"
import { isFocusable } from "./isFocusable"

export interface Action {
  code: KeyboardEvent["code"]
  metaKey?: boolean
  shiftKey?: boolean
  enabled?: () => boolean
  run: (e: KeyboardEvent) => void
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
          (action.enabled?.() ?? true) &&
          e.code === action.code &&
          e.shiftKey === (action.shiftKey ?? false) &&
          (e.ctrlKey || e.metaKey) === (action.metaKey ?? false),
      )
      if (action !== undefined) {
        action.run(e)
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener("keydown", onKeyDown)

    return () => document.removeEventListener("keydown", onKeyDown)
  }, [actions])

  useEffect(() => {
    document.oncut = onCut ?? null
    return () => {
      document.oncut = null
    }
  }, [onCut])

  useEffect(() => {
    document.oncopy = onCopy ?? null
    return () => {
      document.oncopy = null
    }
  }, [onCopy])

  useEffect(() => {
    document.onpaste = onPaste ?? null
    return () => {
      document.onpaste = null
    }
  }, [onPaste])

  return <></>
}
