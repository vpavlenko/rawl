import { observer } from "mobx-react-lite"
import { useCallback } from "react"
import { transposeSelection } from "../../actions"
import { useStores } from "../../hooks/useStores"
import { TransposeDialog } from "./TransposeDialog"

export const PianoRollTransposeDialog = observer(() => {
  const rootStore = useStores()
  const { pianoRollStore } = rootStore
  const { openTransposeDialog } = pianoRollStore

  const onClose = useCallback(
    () => (pianoRollStore.openTransposeDialog = false),
    [pianoRollStore],
  )

  const onClickOK = useCallback(
    (value: number) => {
      transposeSelection(rootStore)(value)
      pianoRollStore.openTransposeDialog = false
    },
    [pianoRollStore],
  )

  return (
    <TransposeDialog
      open={openTransposeDialog}
      onClose={onClose}
      onClickOK={onClickOK}
    />
  )
})
