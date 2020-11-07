import { NoteCoordTransform } from "../../common/transform"
import { useMemoObserver } from "./useMemoObserver"
import { useStores } from "./useStores"
import { useTheme } from "./useTheme"

export const useNoteTransform = () => {
  const rootStore = useStores()
  const theme = useTheme()
  const scaleX = useMemoObserver(() => rootStore.pianoRollStore.scaleX)
  return new NoteCoordTransform(0.1 * scaleX, theme.keyHeight, 127)
}
