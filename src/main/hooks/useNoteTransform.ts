import { useMemo } from "react"
import { NoteCoordTransform } from "../../common/transform"
import { Layout } from "../Constants"
import { useMemoObserver } from "./useMemoObserver"
import { useStores } from "./useStores"
import { useTheme } from "./useTheme"

export const useNoteTransform = () => {
  const { pianoRollStore } = useStores()
  const theme = useTheme()
  const scaleX = useMemoObserver(() => pianoRollStore.scaleX)
  return useMemo(
    () =>
      new NoteCoordTransform(
        Layout.pixelsPerTick * scaleX,
        Layout.keyHeight,
        127
      ),
    [theme, scaleX]
  )
}
