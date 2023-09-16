import { observer } from "mobx-react-lite"
import { useCallback } from "react"
import { useStores } from "../../hooks/useStores"
import { ToolSelector } from "../Toolbar/ToolSelector"

export const PianoRollToolSelector = observer(() => {
  const { pianoRollStore } = useStores()
  return (
    <ToolSelector
      mouseMode={pianoRollStore.mouseMode}
      onSelect={useCallback(
        (mouseMode: any) => (pianoRollStore.mouseMode = mouseMode),
        [],
      )}
    />
  )
})
