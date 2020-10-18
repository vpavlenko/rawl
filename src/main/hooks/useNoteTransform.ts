import { NoteCoordTransform } from "common/transform"
import { useObserver } from "mobx-react-lite"
import { useMemo } from "react"
import { useStores } from "./useStores"
import { useTheme } from "./useTheme"

export const useNoteTransform = () => {
  const { rootStore } = useStores()
  const theme = useTheme()
  const { scaleX } = useObserver(() => ({
    scaleX: rootStore.pianoRollStore.scaleX,
  }))
  return useMemo(
    () => new NoteCoordTransform(0.1 * scaleX, theme.keyHeight, 127),
    [scaleX]
  )
}
